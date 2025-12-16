---
title: python做语音机器人
comments: true
tags: 
  - 语音机器人
  - 树莓派
category: 树莓派
---

这个功能之前用nodejs已经做过了，不过snowboy被百度收购已经不再更新，图灵机器人的回答质量似乎也有点拉跨，跟不上现在的AI进展，所以使用Python重新做了一个。

热词唤醒采用pvporcupine，个人使用可以注册一个，但是生成的配置文件只能在一台机子上使用。注册地址为：[https://picovoice.ai/](https://picovoice.ai)。

语音还是使用百度的语音识别模型，文字转语音和语音转文字功能都还是很不错的。百度语音识别单次只能转换1024个字节，所以回答文字过多时，需要对长文本分段并分段获取语音。

大模型使用百度千帆大模型，除了慢点之外回答质量还行。

百度语音和千帆大模型等可以在百度开发者中心注册，获取APP_ID、API_KEY、SECRET_KEY等信息，注册地址为：[https://developer.baidu.com](https://developer.baidu.com)。

其它也没什么好说的了，无非是调用API，直接给出源码：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Porcupine中文唤醒 + 百度语音识别 + 百度千帆大模型问答 + 百度语音回答
所有信息从 config.json 读取
"""
import json, os, pvporcupine, pyaudio, struct, wave, time, subprocess, tempfile
import threading, queue, signal
from aip import AipSpeech
import appbuilder

# ---------- 1. 读取配置 ----------
with open(os.path.join(os.path.dirname(__file__), "config.json"), "r", encoding="utf-8") as f:
    CFG = json.load(f)

# ---------- 2. 初始化 Porcupine ----------
porc = pvporcupine.create(**CFG["porcupine"])

# ---------- 3. 初始化百度语音 ----------
baidu_cfg = CFG["baidu_asr_tts"]
client = AipSpeech(baidu_cfg["APP_ID"], baidu_cfg["API_KEY"], baidu_cfg["SECRET_KEY"])

# ---------- 4. 初始化千帆 ----------
os.environ["APPBUILDER_TOKEN"] = CFG["qianfan"]["APPBUILDER_TOKEN"]
_qianfan_client = appbuilder.AppBuilderClient(CFG["qianfan"]["APP_ID"])
_qianfan_conversation_id = _qianfan_client.create_conversation()

def ask_qianfan(query: str) -> str:
    try:
        return _qianfan_client.run(_qianfan_conversation_id, query).content.answer
    except Exception as e:
        print("千帆请求失败：", e)
        return "网络开小差了，稍后再试"

# ---------- 5. 其余常量 ----------
SAMPLE_RATE = 16000
FRAME_LEN   = 512
SILENCE_SEC = 1.0
SILENCE_RMS = 150
WAV_FILE    = "temp.wav"

pa = pyaudio.PyAudio()
kw_stream = pa.open(format=pyaudio.paInt16, channels=1,
                    rate=SAMPLE_RATE, input=True,
                    frames_per_buffer=FRAME_LEN)

def play_prompt(audio_file):
    if os.path.exists(audio_file):
        os.system(f"aplay {audio_file}")
    else:
        print(f"警告：音频文件 {audio_file} 不存在，跳过播放")

# ---------- 6. 长文本分段+后台预加载+可打断播放 ----------
curr_player = None          # 当前 aplay 子进程
stop_play   = threading.Event()

def speak(text: str):
    global curr_player, stop_play
    if not text or not text.strip():
        print("TTS 文本为空，跳过播放")
        return

    # 6.1 切成 <=512 字节（GBK）的段
    seg_list, cur, cur_len = [], '', 0
    for ch in text:
        ch_len = len(ch.encode('gbk', errors='ignore'))
        if cur_len + ch_len > 512 and cur:
            seg_list.append(cur)
            cur, cur_len = ch, ch_len
        else:
            cur += ch
            cur_len += ch_len
    if cur:
        seg_list.append(cur)
    if not seg_list:
        return

    # 6.2 后台预合成队列
    tmp_base  = tempfile.mktemp()
    wav_files = [tmp_base + '_0_16k.wav', tmp_base + '_1_16k.wav']
    idx       = 0
    preload_q = queue.Queue(maxsize=1)
    stop_play.clear()

    def _worker():
        for seg in seg_list:
            if stop_play.is_set():
                break
            try:
                wav_bytes = client.synthesis(seg, 'zh', 1,
                                             {'spd': 5, 'pit': 5, 'vol': 9, 'per': 0})
                if not isinstance(wav_bytes, bytes):
                    continue
            except Exception as e:
                print('TTS 异常：', e)
                continue

            nonlocal idx
            target = wav_files[idx]
            idx ^= 1
            raw = tmp_base + '_raw.wav'
            with open(raw, 'wb') as f:
                f.write(wav_bytes)
            subprocess.run(['ffmpeg', '-y', '-i', raw,
                            '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
                            '-b:a', '256k', target],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            os.unlink(raw)
            evt = threading.Event()
            preload_q.put((target, evt))
            evt.wait()

    thd = threading.Thread(target=_worker, daemon=True)
    thd.start()

    # 6.3 顺序播放，随时可打断
    for _ in seg_list:
        if stop_play.is_set():
            break
        try:
            wav_path, evt = preload_q.get(timeout=10)
        except queue.Empty:
            break
        curr_player = subprocess.Popen(['aplay', wav_path],
                                       stdout=subprocess.DEVNULL,
                                       stderr=subprocess.DEVNULL)
        curr_player.wait()
        curr_player = None
        evt.set()
        try:
            os.unlink(wav_path)
        except:
            pass

    # 6.4 清理
    if curr_player and curr_player.poll() is None:
        curr_player.send_signal(signal.SIGTERM)
        curr_player.wait(timeout=0.5)
        curr_player = None
    stop_play.set()
    thd.join(timeout=1)

# 暴露打断接口，主循环检测到唤醒词时调用
def stop_speak():
    global curr_player, stop_play
    stop_play.set()
    if curr_player and curr_player.poll() is None:
        curr_player.send_signal(signal.SIGTERM)
        curr_player.wait(timeout=0.5)
        curr_player = None

# ---------- 7. 录音 ----------
def record_audio(filename=WAV_FILE, silence_sec=SILENCE_SEC, threshold=SILENCE_RMS):
    print("开始录音...")
    max_silent = int(silence_sec * SAMPLE_RATE / FRAME_LEN)
    rec_stream = pa.open(format=pyaudio.paInt16, channels=1,
                         rate=SAMPLE_RATE, input=True,
                         frames_per_buffer=FRAME_LEN * 4)
    frames, silent_frames = [], 0
    for _ in range(max_silent * 10):
        try:
            data = rec_stream.read(FRAME_LEN, exception_on_overflow=False)
        except OSError:
            continue
        frames.append(data)
        pcm = struct.unpack("h" * FRAME_LEN, data)
        rms = (sum(x * x for x in pcm) / FRAME_LEN) ** 0.5
        print(f"\rRMS={rms:.0f} ", end="", flush=True)
        if rms < threshold:
            silent_frames += 1
        else:
            silent_frames = 0
        if silent_frames > max_silent:
            break
    rec_stream.stop_stream()
    rec_stream.close()
    print("\n录音结束")
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(pa.get_sample_size(pyaudio.paInt16))
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(frames))
    return filename

# ---------- 8. 语音识别 ----------
def asr(filename):
    with open(filename, 'rb') as f:
        res = client.asr(f.read(), 'wav', 16000, {'dev_pid': 1537})
    return res['result'][0] if res.get('err_no') == 0 else None

# -------------------------- 主循环 --------------------------
try:
    print("等待唤醒词“小派”...")
    while True:
        pcm = kw_stream.read(FRAME_LEN, exception_on_overflow=False)
        pcm = struct.unpack("h" * FRAME_LEN, pcm)
        if porc.process(pcm) >= 0:
            print("\n【唤醒】检测到“小派”！")
            stop_speak()                    # 立即打断正在播放的语音
            play_prompt(CFG["audio"]["prompt_wav"])
            wav = record_audio()
            play_prompt(CFG["audio"]["confirm_wav"])
            text = asr(wav)
            if text:
                print("识别结果：", text)
                answer = ask_qianfan(text)
                print("千帆回答：", answer)
                speak(answer)
            else:
                speak("我没听清，请再说一遍")
            print("等待下次唤醒...")
except KeyboardInterrupt:
    print("\n程序退出")
finally:
    stop_speak()            # 确保播放器已停
    kw_stream.close()
    pa.terminate()
    porc.delete()
```

配置文件格式如下：

```json
{
  "porcupine": {
    "access_key": "Porcupine AccessKey",
    "keyword_paths": ["小派_zh_raspberry-pi_v3_0_0.ppn"],
    "model_path": "porcupine_params_zh.pv",
    "sensitivities": [0.7]
  },
  "baidu_asr_tts": {
    "APP_ID": "百度语音APP_ID",
    "API_KEY": "百度语音APP_KEY",
    "SECRET_KEY": "百度语音SECRET_KEY"
  },
  "qianfan": {
    "APPBUILDER_TOKEN": "千帆TOKEN",
    "APP_ID": "千帆APP_ID"
  },
  "audio": {
    "prompt_wav": "在呢，请说.wav",
    "confirm_wav": "收到，我来整理下.wav"
  }
}
```

---
title: python做语音机器人
tags:
  - 语音机器人
  - 树莓派
comments: true
category: 树莓派
date: 2026-01-01 21:59:11
---


这个功能之前用nodejs已经做过了，不过snowboy被百度收购已经不再更新，图灵机器人的回答质量似乎也有点拉跨，跟不上现在的AI进展，所以使用Python重新做了一个。

热词唤醒采用pvporcupine，个人使用可以注册使用，注册地址为：[https://picovoice.ai/](https://picovoice.ai)，自己训练生成热词模型（一个.ppn文件和一个.pv文件）和对应的key，但是注意**生成的配置文件只能在一台机子上使用**。

语音还是使用百度的语音识别模型，文字转语音和语音转文字功能都还是很不错的。百度语音识别单次只能转换1024个字节，所以回答文字过多时，需要对长文本分段并分段获取语音。

大模型使用百度千帆大模型，除了慢点之外回答质量还行。

百度语音和千帆大模型等可以在百度开发者中心注册，获取对应的APP_ID、API_KEY、SECRET_KEY等信息，注册地址为：[https://developer.baidu.com](https://developer.baidu.com)。

其它也没什么好说的了，无非是调用API，直接给出源码：

```python
# -*- coding: utf-8 -*-
import json
import os
import pvporcupine
import pyaudio
import struct
import wave
import time
import subprocess
import tempfile
import threading
import queue
import signal
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
        print("千帆请求中...")
        ans = _qianfan_client.run(_qianfan_conversation_id, query).content.answer
        print("千帆返回：", ans)
        return ans
    except Exception as e:
        print("千帆请求失败：", e)
        return "网络开小差了，稍后再试"

# ---------- 5. 常量 & 音频流 ----------
SAMPLE_RATE = 16000
FRAME_LEN = 512
SILENCE_SEC = 1.0
SILENCE_RMS = 150
WAV_FILE = "temp.wav"

pa = pyaudio.PyAudio()
kw_stream = pa.open(format=pyaudio.paInt16, channels=1,
                    rate=SAMPLE_RATE, input=True,
                    frames_per_buffer=FRAME_LEN)

def play_prompt(audio_file):
    if os.path.exists(audio_file):
        os.system(f"aplay -q {audio_file}")
    else:
        print(f"警告：音频文件 {audio_file} 不存在，跳过播放")

# ---------- 6. 后台播放线程：预加载 + 连续播放 ----------
stop_play = threading.Event()      # 主线程→播放线程：立即停
text_queue = queue.Queue()         # 主线程把「待播放文本」塞进来
preload_queue = queue.Queue(maxsize=1)  # 预合成 wav 路径（最大 1 段）
_play_thread = None

def _play_worker():
    while True:
        text = text_queue.get()
        if text is None:           # 退出信号
            break

        stop_play.clear()
        # ---- 6.1 问千帆（可被打断） ----
        if stop_play.is_set():
            continue
        answer = ask_qianfan(text)
        if stop_play.is_set():
            continue

        # ---- 6.2 长文本分段（<=512 字节 GBK） ----
        seg_list, cur, cur_len = [], '', 0
        for ch in answer:
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
            continue
        if stop_play.is_set():
            continue

        # ---- 6.3 预合成 + 连续播放 ----
        tmp_base = tempfile.mktemp()
        n = len(seg_list)

        # 先合成第一段
        def _preload_one(idx):
            if idx >= n or stop_play.is_set():
                return None
            seg = seg_list[idx]
            try:
                print(f"TTS 合成段落 {idx}: {seg}")
                wav_bytes = client.synthesis(seg, 'zh', 1,
                                             {'spd': 5, 'pit': 5, 'vol': 9, 'per': 0})
                if not isinstance(wav_bytes, bytes):
                    return None
            except Exception as e:
                print('TTS 异常：', e)
                return None
            raw = tmp_base + f'_{idx}_raw.wav'
            with open(raw, 'wb') as f:
                f.write(wav_bytes)
            target = tmp_base + f'_{idx}_16k.wav'
            subprocess.run(['ffmpeg', '-y', '-i', raw,
                            '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
                            '-b:a', '256k', target],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            os.unlink(raw)
            return target

        # 预合成第一段
        next_wav = _preload_one(0)
        if not next_wav:
            continue

        # 顺序播放 & 后台预合成下一段
        for i in range(n):
            if stop_play.is_set():
                try: os.unlink(next_wav)
                except: pass
                break
            # 播放当前段
            print("播放段落", i)
            player = subprocess.Popen(['aplay', '-q', next_wav])
            # 后台开始合成下一段
            if i + 1 < n:
                t = threading.Thread(target=lambda idx: preload_queue.put(_preload_one(idx)),
                                     args=(i + 1,), daemon=True)
                t.start()
            # 等待当前段播完
            while player.poll() is None:
                if stop_play.is_set():
                    player.send_signal(signal.SIGTERM)
                    player.wait(timeout=0.5)
                    break
                time.sleep(0.05)
            try: os.unlink(next_wav)
            except: pass
            if stop_play.is_set():
                break
            # 取出下一段 wav
            if i + 1 < n:
                try:
                    next_wav = preload_queue.get(timeout=10)
                except queue.Empty:
                    next_wav = None
                if not next_wav:
                    break

# 启动播放线程
_play_thread = threading.Thread(target=_play_worker, daemon=True)
_play_thread.start()

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
    rec_stream.stop_stream(); rec_stream.close()
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

# ---------- 9. 主循环：永远检测唤醒词 ----------
try:
    print("等待唤醒词“小派”...")
    while True:
        pcm = kw_stream.read(FRAME_LEN, exception_on_overflow=False)
        pcm = struct.unpack("h" * FRAME_LEN, pcm)
        if porc.process(pcm) >= 0:
            print("\n【唤醒】检测到“小派”！")
            stop_play.set()                 # 1. 立即打断正在进行的播放
            play_prompt(CFG["audio"]["prompt_wav"])

            wav = record_audio()
            play_prompt(CFG["audio"]["confirm_wav"])
            text = asr(wav)
            if text:
                print("识别结果：", text)
                text_queue.put(text)       # 2. 把文本交给后台线程
            else:
                text_queue.put("我没听清，请再说一遍")
            print("等待下次唤醒...")
except KeyboardInterrupt:
    print("\n程序退出")
finally:
    stop_play.set()
    text_queue.put(None)        # 通知播放线程退出
    _play_thread.join(timeout=2)
    kw_stream.close()
    pa.terminate()
    porc.delete()
```

`config.json`配置文件格式如下：

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

再附一个使用百度语音生成对应的提示音代码：

```python
from aip import AipSpeech
import subprocess
import os

BAIDU = {
    "APP_ID": "替换成你自己的",
    "API_KEY": "替换成你自己的",
    "SECRET_KEY": "替换成你自己的"
}
client = AipSpeech(BAIDU["APP_ID"], BAIDU["API_KEY"], BAIDU["SECRET_KEY"])

def mkwav(text, out_file):
    wav = client.synthesis(text, 'zh', 1, {'spd': 5, 'pit': 5, 'vol': 9, 'per': 0})
    if not isinstance(wav, bytes):
        print('TTS 失败'); return
    tmp = 'tmp.wav'
    with open(tmp, 'wb') as f:
        f.write(wav)
    # 转码成 16kHz 16bit 单声道 256kbps
    subprocess.run(['ffmpeg', '-y', '-i', tmp,
                    '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
                    '-b:a', '256k', out_file],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.unlink(tmp)
    print('已生成：', out_file)

mkwav("在呢，请说？", "在呢，请说.wav")
mkwav("收到，我来整理下,请稍等", "收到，我来整理下.wav")
```

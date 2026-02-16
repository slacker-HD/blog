---
title: 香橙派armbian做可以语音交互的魔镜
tags:
  - 树莓派
  - Linux
  - armbian
comments: true
category: 树莓派
---


## 1.系统安装与设置

由于香橙派pc plus内置emmc只有8G，所以不能像树莓派那样不顾系统占用，首先从官网找到不带图形系统的镜像安装。

### 1.1 安装nodejs

安装nodejs和pm2，运行如下命令：

```bash
curl -sL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install nodejs
sudo npm install -g cnpm pm2
```

### 1.2 最小化安装X

仔细测试了下，pekwm比openbox依赖更少，占用空间更小，所以默认使用pekwm做窗口管理器：

```bash
sudo apt install xorg xinit xterm pekwm fonts-wqy-microhei
```

### 1.3 配置自动登录

由于没有安装lightdm之类的登录管理器（这样既省空间也省内存），所以首先设置自动登录tty：

```bash
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d
sudo nano /etc/systemd/system/getty@tty1.service.d/autologin.conf
```

写入以下内容：

``` [Unit]
[Service]
ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM
```

设置登录tty后自动登录X:

```bash
nano ~/.bash_profile
```

写入以下内容：

``` bash
if [ "$(tty)" = "/dev/tty1" ]; then
    exec startx
fi
```

### 1.4 显示设置

 添加竖屏显示和屏幕常亮：

```bash
nano ~/.pekwm/startx
```

写入以下内容：

``` bash
xset s off      # 关闭屏保
xset -dpms      # 禁用 DPMS 节能
xset s noblank  # 禁止黑屏
sleep 2 && xrandr --output HDMI-1 --rotate left #设置竖屏
```

### 1.5 安装electron依赖

安装electron依赖，运行如下命令：

```bash
sudo apt install libnss3 libatk1.0-0t64  libatk-bridge2.0-0t64 libcups2t64 libgdk-pixbuf-xlib-2.0-0  libgtk-3-0t64
```

### 1.6 安装python语音依赖项

```bash
sudo apt install libffi-dev build-essential python3-dev ffmpeg
python -m venv venv
pip install sherpa-onnx sounddevice numpy baidu-aip chardet appbuilder dashscope pyaudio requests
```

### 1.7 安装python

armbian默认现在是3.15，但是onnxruntime暂未支持，官方源也没有提供3.11版本的python，所以只能从源码安装，如果后续onnxruntime支持上来了就不需要这么麻烦了。我这里通过`pyenv`安装python。

首先是安装必要的依赖：

```bash
sudo apt update
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
libffi-dev liblzma-dev git
```

之后可以编译安装pyenv：

```bash
curl https://pyenv.run | bash
```

添加以下内容到~/.bashrc中：

``` bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init - bash)"' >> ~/.bashrc
Then, if you have ~/.profile, ~/.bash_profile or ~/.bash_login, add the commands there as well. If you have none of these, create a ~/.profile and add the commands there.

to add to ~/.profile:
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.profile
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.profile
echo 'eval "$(pyenv init - bash)"' >> ~/.profile
to add to ~/.bash_profile:
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
echo 'eval "$(pyenv init - bash)"' >> ~/.bash_profile
```

重启 shell 或运行：

```bahs
source ~/.bashrc
```

安装指定版本python（如 3.11.8）:

```bash
pyenv install 3.11.8
```

设全局或本地python版本：

```bash
pyenv global 3.11.8        # 全局
# 或
pyenv local 3.11.8         # 仅当前目录
```

最后创建虚拟环境，此时python就是 3.11.8：

```bash
python -m venv venv
```

最后把MagicMirror拷贝到/home/pi/MagicMirror/目录下并安装依赖，同时把python语音机器人的的依赖安装好，加上系统总共占用4G多一点。

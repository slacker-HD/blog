---
title: 树莓派motion测试
tags:
---


1.安装motion 
输入命令：

sudo apt-get install motion
1
2.然后配置motion daemon 守护进程 
输入命令编辑motion：

sudo nano /etc/default/motion
1
把里面的no修改成yes，让他可以一直在后台运行：

start_motion_daemon=yes
1
3.修改motion的配置文件 
（1）输入命令：

sudo vim /etc/motion/motion.conf
1
（2）修改配置文件： 
将第11行的daemon off 改成daemon on，如下图：



该文件很长，需要一直往下翻，直到464行你才看到端口号8081，我们通过这个端口来读取视频数据，这里无需修改！如下图：



然后到第477行将stream_localhost on改成off，即关闭 localhost 的限制，如下图：



当然，你也可以设定图片的分辨率，在第90行进行修改： 


最后，vim编辑器下按esc然后输入：wq，即保存退出。

3.配置启动

（1）输入下面命令启动服务：

sudo service motion start  
1
（2）输入以下命令开启motion：

sudo motion
————————————————
版权声明：本文为CSDN博主「能跑就不休息」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/qq_39500821/article/details/80647600


打开配置文件
sudo nano /etc/motion/motion.conf

找到 framerate 并设置成 50（或者更大，根据试验自己选择），延时可解决。

如果卡顿则找到 stream_maxrate 将这个参数设置为 100 或者小点的（根据试验自己选择）

最后保存，重启motion。
————————————————
版权声明：本文为CSDN博主「myhuisir」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/weixin_41945913/article/details/106063431


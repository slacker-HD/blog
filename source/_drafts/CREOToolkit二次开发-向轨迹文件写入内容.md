---
title: CREO Toolkit二次开发-向轨迹文件写入内容
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

对于大型系统来说，一般使用日志文件用于处理历史数据、诊断问题的追踪以及理解系统的活动。Creo使用轨迹文件记录所有的操作，当然也给Toolkit二次开发写入轨迹文件提供了接口，可以向轨迹文件写入一些关键信息。
写入轨迹文件使用`ProTrailfileCommentWrite`函数，参数为需要写入信息的wchar_t字符串，实例代码如下：

```cpp
ProError status;
wchar_t *str = L"!Test message";
status = ProTrailfileCommentWrite(str);
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

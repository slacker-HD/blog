---
title: CREOToolkit二次开发-绘图比例设置
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

绘图文件默认比例获取与设定可使用`ProDrawingScaleGet`、`ProDrawingScaleSet`完成。方法的参数简单明了也没什么好解释的，直接给出设定当前sheet的绘图比例代码：

```c
void SetDrawingScale(double scale)
{
  ProError status;
  ProMdl drawing;
  status = ProMdlCurrentGet(&drawing);
  status = ProDrawingScaleSet(drawing, NULL, -1, scale);
  status = ProMacroLoad(L"~ Command `ProCmdDwgRegenModel`;");
}
```

实际工程中，把绘图比例的常用值设定为菜单选项即可实现绘图比例的快速设定。

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

---
title: CREOToolkit二次开发-绘图比例设置
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

绘图文件默认比例获取与设定可使用`ProDrawingScaleGet`、`ProDrawingScaleSet`完成。方法调用很简单，

```c
void SetDrawingScale()
{
  ProError status;
  ProMdl drawing;
  double scale = 0.5;
  status = ProMdlCurrentGet(&drawing);
  status = ProMessageDisplay(MSGFILE, "IMI_PrompDrawingSetScaling", &scale);
  status = ProMessageDoubleRead(NULL, &scale);
  if (status != PRO_TK_NO_ERROR && status != PRO_TK_GENERAL_ERROR)
  {
    return;
  }
  status = ProDrawingScaleSet(drawing, NULL, -1, scale);
  status = ProMacroLoad(L"~ Command `ProCmdDwgRegenModel`;");
}
```


代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
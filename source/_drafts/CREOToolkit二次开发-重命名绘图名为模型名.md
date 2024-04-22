---
title: CREO Toolkit二次开发-重命名绘图名为模型名
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文介绍将绘图文件名称改为对应的模型名称，主要实现同名工程图功能的补遗。

首先获得当前绘图名称：

```c
status = ProMdlCurrentGet(&drawing);
status = ProMdlNameGet(drawing, drawingName);
```

之后获取对应的模型名称：

```c
status = ProMdlDataGet(drawing, &drawingData);
status = ProDrawingCurrentsolidGet(drawing, &solid);
status = ProMdlNameGet(solid, mdlName);
```

最后比较两者名称，如不同则对绘图文件执行重命名操作，同时需要注意模型所在路径可能与工作目录不一致的问题：

```c
status = ProWstringCompare(mdlName, drawingName, PRO_VALUE_UNUSED, &compResult);
if (compResult != 0)
{
  status = ProDirectoryChange(drawingPath);
  status = ProMdlRetrieve(mdlName, PRO_MDL_DRAWING, &tmpMdl);
  if (status != PRO_TK_NO_ERROR)
  {
    status = ProMdlRename(drawing, mdlName);
    status = ProMdlSave(drawing);
  }
  status = ProDirectoryChange(currentPath);
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。

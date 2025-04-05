---
title: CREO Toolkit二次开发-草绘直线延长和缩短
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

仍然是丰富绘图草绘功能.Creo在草绘直线时,缺少沿原直线延长和缩短的功能,所以使用Toolkit开发了这个功能。




```c
ProError ProDrawResizeBar(ProCurvedata CurveData)
{
  ProError status;
  ProGraphicsPenPosition(CurveData.line.end1);
  ProGraphicsCircleDraw(CurveData.line.end1, 5);
  ProGraphicsPenPosition(CurveData.line.end2);
  ProGraphicsCircleDraw(CurveData.line.end2, 5);
  return PRO_TK_NO_ERROR;
}
```

```c
while (1)
{
  status = ProDrawResizeBar(curvedata);
  status = ProMouseTrack(options, &button_pressed, positionmouse);
  // 按任意鼠标键退出，注意PRO_ANY_BUTTON是个坑
  if (button_pressed == PRO_LEFT_BUTTON || button_pressed == PRO_RIGHT_BUTTON || button_pressed == PRO_MIDDLE_BUTTON)
  {
    status = ProWindowRepaint(PRO_VALUE_UNUSED);
    break;
  }
  // 这里要计算了
  calculate_and_update(curvedata.line.end1, curvedata.line.end2, positionmouse, bidirectional);
  // 实时更改线段
  status = ProDtlentitydataCurveSet(entdata, &curvedata);
  status = ProDtlentityModify(&modelitem, NULL, entdata);
  status = ProWindowCurrentGet(&wid);
  status = ProWindowRefresh(wid);
}
```

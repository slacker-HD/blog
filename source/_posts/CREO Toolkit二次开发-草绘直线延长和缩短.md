---
title: CREO Toolkit二次开发-草绘直线延长和缩短
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2025-07-02 10:57:14
---


仍然是丰富绘图草绘功能，实现Creo在草绘直线可以沿原直线延长和缩短的功能。

与<a href="[https://www.hudi.site/2020/05/02/CREO Toolkit二次开发-Ribbon界面的操作/](https://www.hudi.site/2025/05/07/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E8%8D%89%E7%BB%98%E7%9B%B4%E7%BA%BF%E4%BF%AE%E6%94%B9%E5%9E%82%E7%9B%B4%E6%B0%B4%E5%B9%B3/)" target="_blank">CREO Toolkit二次开发-草绘直线修改垂直水平</a>一文修改草绘的操作一致，通过while循环使用`ProMouseTrack`获取鼠标坐标，计算鼠标坐标在直线或直线延长线上的投影坐标，并计算出直线延长线或直线的投影坐标，最后根据投影坐标更新直线，代码如下：

```c
while (1)
{
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

`calculate_and_update`函数主要用于计算鼠标坐标在直线或直线延长线上的投影坐标，简单的几何计算，也没有什么需要特殊说明的，给出代码：

```c
void calculate_and_update(ProPoint3d start, ProPoint3d end, ProPoint3d third, int bidirectional)
{
  ProPoint3d point_on_x;
  ProPoint3d point_on_y;
  double dist_x;
  double dist_y;
  ProPoint3d closest_point;
  double dist_to_start;
  double dist_to_end;
  ProPoint3d mid;
  ProPoint3d mirror;
  int moved_point = 0;

  calculate_projection_x(start, end, third, point_on_x);
  calculate_projection_y(start, end, third, point_on_y);

  // 计算距离
  dist_x = distance(third, point_on_x);
  dist_y = distance(third, point_on_y);

  if (dist_x < dist_y)
  {
    closest_point[0] = point_on_x[0];
    closest_point[1] = point_on_x[1];
    closest_point[2] = 0.0; // 保留 z 坐标
  }
  else
  {
    closest_point[0] = point_on_y[0];
    closest_point[1] = point_on_y[1];
    closest_point[2] = 0.0; // 保留 z 坐标
  }

  // 判断更短的点距离起点还是终点更近
  dist_to_start = distance(closest_point, start);
  dist_to_end = distance(closest_point, end);
  midpoint(start, end, mid);

  if (dist_to_start < dist_to_end)
  {
    moved_point = 1;
    start[0] = closest_point[0];
    start[1] = closest_point[1];
    start[2] = 0.0; // 保留 z 坐标
    if (bidirectional)
    {
      mirror_point(closest_point, mid, mirror);
      end[0] = mirror[0];
      end[1] = mirror[1];
      end[2] = 0.0; // 保留 z 坐标
    }
  }
  else
  {
    moved_point = 2;
    end[0] = closest_point[0];
    end[1] = closest_point[1];
    end[2] = 0.0; // 保留 z 坐标
    if (bidirectional)
    {
      mirror_point(closest_point, mid, mirror);
      start[0] = mirror[0];
      start[1] = mirror[1];
      start[2] = 0.0; // 保留 z 坐标
    }
  }
}
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

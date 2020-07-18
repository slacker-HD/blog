---
title: Creo Toolkit二次开发-视图旋转
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

“Creo Toolkit二次开发-模型导出图片”一文中我们介绍了如何将视图导出图片。其实在导出图片之前，通常我们还需要将视图旋转到制定位置，本节介绍Toolkit的视图旋转的操作。与VBAPI一样，Toolkit同样提供了ProViewRotate和ProViewMatrixSet两个函数用于在当前视图的基础上进行增量旋转以及将视图旋转到指定位置两种操作，两个函数的参数相对简单，与VBAPI有类似之处，在此不再赘述了，直接给出代码供参考：

```c
void _setView(ProRotate rotation_axis, double angle)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  status = ProViewRotate(NULL, NULL, rotation_axis, angle);
  status = ProWindowClear(PRO_VALUE_UNUSED);
  status = ProWindowRefresh(PRO_VALUE_UNUSED);
}

void _setViewtoFrontByMatrix()
{
  ProMatrix matrix;
  ProError status;
  int i,j;
  for(i=0;i<4;i++)
  {
    for(j=0;j<4;j++)
      matrix[i][j] = 0;
  }
  matrix[3][3]=1;
  matrix[0][0]=matrix[1][1]=matrix[2][2]=1;
  status =  ProViewMatrixSet(NULL,NULL,matrix);
  status = ProWindowClear(PRO_VALUE_UNUSED);
  status = ProWindowRefresh(PRO_VALUE_UNUSED);
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

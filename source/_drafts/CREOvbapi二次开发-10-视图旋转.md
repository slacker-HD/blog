---
title: CREO vbapi二次开发-10-视图旋转
tags:
---

本节介绍VBAPI的视图旋转的操作。旋转视图到特定的位置可方便进行截图等操作，常用的方法主要包括在当前视图的基础上进行增量旋转以及将视图旋转到指定位置两种操作。

## 1.增量旋转

根据给定轴对当前视图进行旋转可使用IpfcView的Rotate方法完成。Rotate方法有两个参数，第一个参数为EpfcCoordAxis枚举类型，分别对应X、Y、Z三个轴，第二个参数Angle则表示旋转角度。旋转视图后，需要刷新当前窗口，实例代码如下：

```vb
model = asyncConnection.Session.CurrentModel
CType(model, IpfcViewOwner).GetCurrentView.Rotate(Axis, Angle)
asyncConnection.Session.CurrentWindow.Refresh()
asyncConnection.Session.CurrentWindow.Repaint()
```

## 2.指定位置

将视图旋转到指定位置只需要设定当前视图的位姿矩阵即可，即设定当前视图的的Transform属性。以视图设为FRONT为例，代码如下：

```vb
Dim transform As IpfcTransform3D
transform = (New CCpfcTransform3D).Create(Nothing)
For i = 0 To 3
  For j = 0 To 3
    transform.Matrix.Set(i, j, 0)
  Next
Next
transform.Matrix.Set(3, 3, 1)
transform.Matrix.Set(0, 0, 1)
transform.Matrix.Set(1, 1, 1)
transform.Matrix.Set(2, 2, 1)

model = asyncConnection.Session.CurrentModel
CType(model, IpfcViewOwner).GetCurrentView.Transform = TransForm
asyncConnection.Session.CurrentWindow.Refresh()
asyncConnection.Session.CurrentWindow.Repaint()
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。

---
title: CREO Toolkit二次开发-线缆装配（下）
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

上一篇文章已经完成了线束、线轴以及元件的操作，接下来可开始布线（Route）。Toolkit一共提供了ProCableRoutingStart、ProCableThruLocationRoute、roCableRoutingEnd、roCablelocationrefAlloc、roCablelocationrefFree五个函数用于对于布线操作。使用Toolkit进行布线操作官方文档给出解释如下，大致包括6个步骤：

> To Route a Group of Cables Through a Sequence of Locations:
> 1.Call ProCableRoutingStart() to identify the cables to be routed.
> 2.Call ProCablelocationrefAlloc() to create a routing reference location structure.
> 3.Call ProCableThruLocationRoute() for each location through which to route the cables.
> 4.Call ProCablelocationrefFree() to free the location reference.
> 5.Call ProCableRoutingEnd() to complete the routing.
> 6.Call ProSolidRegenerate() to make Creo Parametric calculate the resulting cable geometry and > create the necessary cable features.
> Note You must also call the function ProWindowRepaint() to see the new cables.

根据测试，实际操作过程中布线需要确定对应的位置和参照，而对应的位置和参照一般都会超过一个，所以上面的2-4步可以循环调用，实际代码流程图如下所示：







## 1.开始布线

调用ProCableRoutingStart函数即可开始布线。ProCableRoutingStart函数的参数有三个，第一个为装配体句柄，第二步为一个ProCable的ProArray数组，将上一篇文章中生成的ProCable结构体对象插入数组即可，第三个为ProRouting句柄，作为输出用于后续的布线操作。开始布线的示例代码如下：



```cpp
  status = ProArrayAlloc(0, sizeof(ProCable), 1, (ProArray *)&array_cable);
  status = ProArrayObjectAdd((ProArray *)&array_cable, PRO_VALUE_UNUSED, 1, &cable);
  status = ProCableRoutingStart(asm_mdl, array_cable, &cable_route_data);
  if (status != PRO_TK_NO_ERROR)
  {
    status = ProArrayFree((ProArray *)&array_cable);
    return;
  }
```

## 2.布线操作

### 2.1 构建布线参考对象

### 2.2 布线

### 2.3 释放内存







<div align="center">
    <img src="/img/proe/CableRoute2.png" style="width:80%" align="center"/>
    <p>图 布线的</p>
</div>

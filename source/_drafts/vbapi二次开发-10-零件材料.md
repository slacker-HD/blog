---
title: CREO vbapi二次开发-10-零件材料
tags:
  - CREO
  - VBAPI
  - CREO二次开发
category: CREO二次开发
comments: true
---

材料在CREO中被看做零件的一个属性，vbapi中使用IpfcMaterial类进行描述。IpfcMaterial类中提供了如Name、MassDensity、Hardness等属性描述材料的名称、密度、硬度等属性，详见参考文档。以下介绍如何读取、修改零件的材料信息。

## 1.读取零件材料信息

vbapi提供了一个集成自IpfcModel类的IpfcPart类对零件的材料信息进行管理。IpfcPart类的CurrentMaterial属性为IpfcMaterial类，可以直接获取零件使用的材料信息：

```vb
part = CType(model, IpfcPart)
material = part.CurrentMaterial
GetMaterial = material.Name
```

IpfcPart类的ListMaterials方法则用于获取当前零件已包含的材料信息：

```vb
part = CType(model, IpfcPart)
materials = part.ListMaterials()
For i = 0 To materials.Count - 1
  '访问各材料
Next
```

## 2. 设定零件材料

设定零件材料只需直接指定IpfcPart类的CurrentMaterial属性即可：

```vb
part.CurrentMaterial = material
```

实际操作过程中，需要从磁盘中读取材料文件(*.mtl)然后指定给零件。利用IpfcPart类的RetrieveMaterial方法可以完成将材料文件加入到零件包含材料的数据库中。使用该方法时需要注意两个问题，一是函数的唯一参数不需要带文件后缀名，二是调用前需要将当前工作目录工作目录设置为材料文件所在目录。所以读取材料文件并设定为零件材料的示例代码如下：

```vb
'打开材料文件时必须将工作目录设置为材料文件所在目录
asyncConnection.Session.ChangeDirectory(MtlPath)
part = CType(model, IpfcPart)
'材料文件加载到零件中
material = part.RetrieveMaterial(MtlName)
'设定材料
part.CurrentMaterial = material
```

**P.S. 完成本文后，之前开发的<a href="https://www.hudi.site/2019/12/23/CREO vbapi二次开发-实用小工具-批处理工具/" target="_blank">批处理工具</a>也更新了批量设定零件材料功能。**

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。

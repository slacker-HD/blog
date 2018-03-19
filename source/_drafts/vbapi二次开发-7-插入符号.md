---
title: vbapi二次开发-7-插入符号
tags:
  - CREO
  - VBAPI
comments: true
category: CREO二次开发
date: 2018-03-20
---

插入符号与插入注解类似，本质也是设置符号的IpfcDetailSymbolInstInstructions后再调用IpfcDrawing类及IpfcDetailSymbolInstItem类的相关方法创建并显示。由于注解、符号、草绘等均派生于IpfcDetailItem类，故插入符号的方式方法与插入注解的方式方法在很多地方是相通的。符号由IpfcDetailSymbolInstItem类进行描述，而创建IpfcDetailSymbolInstItem类的选项则由IpfcDetailSymbolInstInstructions类进行描述。只要设定好IpfcDetailSymbolInstInstructions类的相关属性，即可完成插入符号操作，关键步骤如图7-2所示。

<div align="center">
    <img src="/img/proe/vbapi7.2.png" style="width:40%" align="center"/>
    <p>图 7-2 插入符号关键步骤</p>
</div>

## 1.插入自由放置的符号

符号本身作为一个文件保存在硬盘上，首先需要加载该文件，调用IpfcDrawing类的RetrieveSymbolDefinition方法即可，之后便可调用CCpfcDetailSymbolInstInstructions类的Create方法初始化IpfcDetailSymbolInstInstructions类，如下所示：

```vb
Dim symbolDefinition As IpfcDetailSymbolDefItem
Dim symInstructions As IpfcDetailSymbolInstInstructions
'加载符号文件，注意这里没有进行校验
symbolDefinition = drawing.RetrieveSymbolDefinition(Symbolfile, CObj(Symbolpath), Nothing, True)
'初始化并设置symInstructions的值
symInstructions = (New CCpfcDetailSymbolInstInstructions).Create(symbolDefinition)
```

如何符号包含可选文字，则需要设定其可选文字的值，如粗糙度符号的粗糙度值等。符号是否包含可选文字及可选文字的名称和值，可在Creo中查看符号的相关属性获取，如图7-3所示。可选文字由CpfcDetailVariantTexts类进行描述，该序列中的IpfcDetailVariantText类通过调用CCpfcDetailVariantText类的Create方法指定可选文本的名称和值即可生成。为便于描述，本文用了一个字典描述可变文本的名称和值，生成CpfcDetailVariantTexts对象的方法如下所示：

```vb
Dim Texts As New Dictionary(Of String, String) From {
  {"roughness_height", "6.3"}
}
Private Function SetDetailVariantTexts(ByVal Dicts As Dictionary(Of String, String)) As CpfcDetailVariantTexts
  Dim varText As IpfcDetailVariantText
  If Dicts.Count > 0 Then
    SetDetailVariantTexts = New CpfcDetailVariantTexts
    For Each text As KeyValuePair(Of String, String) In Dicts
      varText = (New CCpfcDetailVariantText).Create(text.Key, text.Value)
      SetDetailVariantTexts.Append(varText)
    Next
  Else
    SetDetailVariantTexts = Nothing
  End If
  Return SetDetailVariantTexts
End Function
```

<div align="center">
    <img src="/img/proe/vbapi7.3.png" style="width:40%" align="center"/>
    <p>图 7-3 可选文字</p>
</div>



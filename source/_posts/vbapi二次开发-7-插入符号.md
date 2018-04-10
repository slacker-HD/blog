---
title: vbapi二次开发-7-插入符号
tags:
  - CREO
  - VBAPI
comments: true
category: CREO二次开发
date: 2018-04-10
---


插入符号与插入注解类似，本质也是设置符号的IpfcDetailSymbolInstInstructions后再调用IpfcDrawing类及IpfcDetailSymbolInstItem类的相关方法创建并显示。由于注解、符号、草绘等均派生于IpfcDetailItem类，故插入符号的方式方法与插入注解的方式方法在很多地方是相通的。符号由IpfcDetailSymbolInstItem类进行描述，而创建IpfcDetailSymbolInstItem类的选项则由IpfcDetailSymbolInstInstructions类进行描述。只要设定好IpfcDetailSymbolInstInstructions类的相关属性，即可完成插入符号操作，关键步骤如图7-2所示。

<div align="center">
    <img src="/img/proe/vbapi7.2.png" style="width:70%" align="center"/>
    <p>图 7-2 插入符号关键步骤</p>
</div>

## 1.获取符号对象

符号本身作为一个文件保存在硬盘上，首先需要加载该文件，调用IpfcDrawing类的RetrieveSymbolDefinition方法即可，之后便可调用CCpfcDetailSymbolInstInstructions类的Create方法初始化IpfcDetailSymbolInstInstructions类，代码如下：

```vb
Dim symbolDefinition As IpfcDetailSymbolDefItem
Dim symInstructions As IpfcDetailSymbolInstInstructions
'加载符号文件，注意这里没有进行校验
symbolDefinition = drawing.RetrieveSymbolDefinition(Symbolfile, CObj(Symbolpath), Nothing, True)
'初始化并设置symInstructions的值
symInstructions = (New CCpfcDetailSymbolInstInstructions).Create(symbolDefinition)
```

## 2.设置符号文字

如果符号包含可选文字，则需要设定其可选文字的值，如粗糙度符号的粗糙度值等。符号是否包含可选文字及可选文字的名称和值，可在Creo中查看符号的相关属性获取，如图7-3所示。可选文字由CpfcDetailVariantTexts类进行描述，该序列中的IpfcDetailVariantText类通过调用CCpfcDetailVariantText类的Create方法指定可选文本的名称和值即可生成。为便于描述，本文用了一个字典描述可变文本的名称和值，生成CpfcDetailVariantTexts对象的方法如下所示：

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

## 3.摆放符号

与插入注解操作类似，摆放符号中西设定IpfcDetailSymbolInstInstructions参数即可。IpfcDetailSymbolInstInstructions主要需要设定TextValues、AttachOnDefType、DefAttachment、InstAttachment四个重要参数。  
TextValues为符号的文字选项，上文已说明，只要设置其值就好：  

```vb
symInstructions.TextValues = SetDetailVariantTexts(Texts)
```

AttachOnDefType为一个EpfcSymbolDefAttachmentType枚举类型，表示符号的放置类型，本文主要用包括:

```vb
EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_FREE '自由放置
EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_LEFT_LEADER, EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_RIGHT_LEADER, EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_RADIAL_LEADER'引线
EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_ON_ITEM, EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_NORMAL_TO_ITEM'垂直于图元
```

根据不同的放置类型，需要设定DefAttachment和InstAttachment，与注解的定义类似。生成DefAttachment和InstAttachment主要包括通过鼠标获得位置、选取对象、对象生成等操作，主要代码如下：

```vb
''' <summary>
''' 设置IpfcDetailSymbolInstInstructions的SymbolDefAttachment
''' </summary>
''' <param name="AttachOnDefType">符号放置方式</param>
''' <param name="selectedObject">放置点</param>
''' <returns>SymbolDefAttachment对象</returns>
Private Function SetSymbolDefAttachment(ByVal AttachOnDefType As EpfcSymbolDefAttachmentType, ByVal selectedObject As IpfcSelection) As IpfcSymbolDefAttachment
  Return (New CCpfcSymbolDefAttachment).Create(AttachOnDefType, selectedObject.Point)
End Function

''' <summary>
''' 选择获取一个对象,这里为简化代码，未进行有效性检测
''' </summary>
''' <param name="filter">选择对象类型，默认为边</param>
''' <returns>选择对象</returns>
Private Function SelectObject(Optional ByVal filter As String = "edge") As IpfcSelection
  Dim selections As CpfcSelections
  Dim selectionOptions As IpfcSelectionOptions
  '======================================================================
  '这里为简化代码，未对selectEdge进行检测
  '======================================================================
  selectionOptions = (New CCpfcSelectionOptions).Create(filter)
  selectionOptions.MaxNumSels = 1
  selections = asyncConnection.Session.Select(selectionOptions, Nothing)
  SelectObject = selections.Item(0)
  Return SelectObject
End Function

''' <summary>
''' 获取鼠标点击位置
''' </summary>
''' <returns></returns>
Private Function MousePosAttatchement() As IpfcAttachment
  Dim point As CpfcPoint3D
  Dim mouse As IpfcMouseStatus
  point = New CpfcPoint3D
  mouse = asyncConnection.Session.UIGetNextMousePick(EpfcMouseButton.EpfcMOUSE_BTN_LEFT)
  point = mouse.Position
  MousePosAttatchement = (New CCpfcFreeAttachment).Create(point)
  Return MousePosAttatchement
End Function

''' <summary>
''' 生成Leaders
''' </summary>
''' <param name="leader"></param>
''' <param name="position"></param>
''' <returns>生成的leaders</returns>
Private Function SetAttatchements(ByVal leader As IpfcAttachment, ByVal position As IpfcAttachment) As IpfcDetailLeaders
  Dim attachments As CpfcAttachments
  SetAttatchements = (New CCpfcDetailLeaders).Create()
  SetAttatchements.ItemAttachment = position
  SetAttatchements.ElbowLength = Nothing
  If (leader IsNot Nothing) Then
    attachments = New CpfcAttachments
    attachments.Insert(0, leader)
    SetAttatchements.Leaders = attachments
  End If
  Return SetAttatchements
End Function
```

最终插入符号代码如下：

```vb
Select Case AttachOnDefType
  Case EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_FREE '自由放置，所以不需要选择边等对象操作，但是需要鼠标点击选择
    '鼠标左键点选符号放置的位置
    position = MousePosAttatchement()
  Case EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_LEFT_LEADER, EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_RIGHT_LEADER, EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_RADIAL_LEADER
    '动态选择一个边,或者作为引出线，或者作为垂直于图元上的点
    selectedObj = SelectObject()
    '鼠标左键点选符号放置的位置
    position = MousePosAttatchement()
    '初始化leader
    leader = (New CCpfcParametricAttachment).Create(selectedObj)
    '设置SymbolDefAttachment
    symbolDefAttachment = SetSymbolDefAttachment(EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_NORMAL_TO_ITEM, selectedObj)
  Case EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_ON_ITEM, EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_NORMAL_TO_ITEM
    '动态选择一个边,或者作为引出线，或者作为垂直于图元上的点
    selectedObj = SelectObject()
    '设置位置
    position = (New CCpfcParametricAttachment).Create(selectedObj)
    CType(position, IpfcParametricAttachment).AttachedGeometry = selectedObj '为了代码通用性，使用父类IpfcAttachment定义position，这里应该用子类IpfcParametricAttachment，故强制类型转化下
    '设置SymbolDefAttachment
    symbolDefAttachment = SetSymbolDefAttachment(EpfcSymbolDefAttachmentType.EpfcSYMDEFATTACH_NORMAL_TO_ITEM, selectedObj)
  Case Else
    Throw New NotImplementedException() '其余的未处理
End Select
'设置Attachments
allAttachments = SetAttatchements(leader, position)
'加载符号文件，注意这里没有进行校验
symbolDefinition = drawing.RetrieveSymbolDefinition(Symbolfile, CObj(Symbolpath), Nothing, True)
'初始化并设置symInstructions的值
symInstructions = (New CCpfcDetailSymbolInstInstructions).Create(symbolDefinition)
'设置文字
symInstructions.TextValues = SetDetailVariantTexts(Texts)
'设置高度
symInstructions.ScaledHeight = 3.5
'设置三个显示方式的重要属性
symInstructions.DefAttachment = symbolDefAttachment
symInstructions.InstAttachment = allAttachments
symInstructions.AttachOnDefType = AttachOnDefType
```
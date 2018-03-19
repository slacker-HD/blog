---
title: vbapi二次开发-7-插入注解
tags:
  - CREO
  - VBAPI
comments: true
category: CREO二次开发
date: 2018-03-19 00:00:00
---


本节介绍VBAPI工程图注解相关功能。

注解、符号、草绘等均派生于IpfcDetailItem类，注解由IpfcDetailNoteItem类详细描述。创建注解的关键步骤包括设置注解文字内容，设置注解所在坐标以及引出连接线的元素等。

## 1.插入自由放置的注解

与正常Creo的操作一样，插入自由放置的注解主要的是要设置注解的文字内容和其所在坐标。

注解的文字由IpfcDetailTexts类进行描述，记录了注解的多行文字，是一个序列类型的类。IpfcDetailText为IpfcDetailTexts类包含元素的类型，其属性Text表示该行文字内容，其余如FontName等属性表示注解的格式。IpfcDetailText通过CCpfcDetailText类的Creat方法完成初始化，函数的参数为文字内容。生成IpfcDetailTexts的代码如下：

```vb
Private Function StrstoTextlines(ByVal Texts As String) As CpfcDetailTextLines
  Dim detailText As IpfcDetailText
  Dim detailTexts As CpfcDetailTexts
  Dim textLine As IpfcDetailTextLine
  Dim i As Integer
  Dim Strs() As String
  '将String赋值给textLines
  StrstoTextlines = New CpfcDetailTextLines
  Strs = Split(Texts, Chr(10)) '根据回车符分割确定行数
  '根据行数创建对象并添加内容
  For i = 0 To Strs.Length - 1
    detailText = (New CCpfcDetailText).Create(Strs(Strs.Length - i - 1)) '注意顺序
    detailTexts = New CpfcDetailTexts
    detailTexts.Insert(0, detailText)
    textLine = (New CCpfcDetailTextLine).Create(detailTexts)
    StrstoTextlines.Insert(0, textLine)
  Next
End Function
```

摆放信息由IpfcDetailLeaders类描述。IpfcDetailLeaders类有两个重要属性ItemAttachment(IpfcAttachment类)和Leaders(IpfcAttachments类)。ItemAttachment记录注解的摆放位置，Leaders记录了注解引线的相关信息。由于自由放置的注解没有引线的相关信息，故只需根据上述内设置其ItemAttachment即可。注解如何放置由IpfcAttachment类进行描述，根据不同类型的放置方式，分别有IpfcFreeAttachment、IpfcOffsetAttachment、IpfcParametricAttachment、IpfcUnsupportedAttachment四个派生类对应不同的放置方式。IpfcFreeAttachment用于描述自由放置方式，由CCpfcFreeAttachment.Create方法完成初始化，其参数inAttachmentPoint为IpfcPoint3D类，表示注解放置的坐标位置。一般获取放置位置可通过用户在绘图中点击的方式获取，只需调用Session的UIGetNextMousePick方法即可。生成IpfcFreeAttachment的代码如下：

```vb
Private Function MousePosAttatchement() As IpfcFreeAttachment
  Dim point As CpfcPoint3D
  Dim mouse As IpfcMouseStatus
  '鼠标左键点选注解放置的位置
  point = New CpfcPoint3D
  mouse = asyncConnection.Session.UIGetNextMousePick(EpfcMouseButton.EpfcMOUSE_BTN_LEFT)
  point = mouse.Position
  MousePosAttatchement = (New CCpfcFreeAttachment).Create(point)
  Return MousePosAttatchement
End Function
```

注解对象IpfcDetailNoteItem类由IpfcDrawing类的CreateDetailItem方法完成。CreateDetailItem的参数为IpfcDetailCreateInstructions类，分别有IpfcDetailEntityInstructions、IpfcDetailNoteInstructions、IpfcDetailGroupInstructions、IpfcDetailSymbolDefInstructions、IpfcDetailSymbolInstInstructions等，记录这些详细元素的信息。注解元素由
IpfcDetailNoteInstructions类进行描述，提供了如Color、Horizontal、Vertical等属性描述相关信息。而插入基本注解必须设置TextLines、Leader两个属性，其中TextLines属性为IpfcDetailTexts类，如何生成上文已说明，Leader为IpfcDetailLeaders类，插入自由放置的注解的生成方式也在上文进行说明。生成注解对象后，调用IpfcDetailNoteItem类的Show方法即可完成自由放置的注解的放置。插入自由放置的注解的示例代码如下：

```vb
    Public Sub CreateNoteWithoutLeader(ByVal Texts As String)
        Dim model As IpfcModel
        Dim drawing As IpfcDrawing
        Dim textLines As CpfcDetailTextLines
        Dim noteInstructions As IpfcDetailNoteInstructions
        Dim note As IpfcDetailNoteItem
        Dim position As IpfcFreeAttachment
        Dim allAttachments As IpfcDetailLeaders
        If Isdrawding() = True Then
          model = asyncConnection.Session.CurrentModel
          drawing = CType(model, IpfcDrawing)
          'String转CpfcDetailTextLines
          textLines = StrstoTextlines(Texts)
          '鼠标左键点选注解放置的位置
          position = MousePosAttatchement()
          '设置Attachments
          allAttachments =  (New CCpfcDetailLeaders).Create()
          allAttachments.ItemAttachment = position
          '设置noteInstructions
          noteInstructions = (New CCpfcDetailNoteInstructions).Create(textLines)
          noteInstructions.Leader = allAttachments
          '创建note并显示
          note = drawing.CreateDetailItem(noteInstructions)
          note.Show()
      End If
    End Sub
```

## 2.插入带引线的注解

插入带引线的注解与插入自由放置的注解的方式相同，只是需要增加IpfcDetailLeaders类的Leaders属性的设置过程。Leaders(IpfcAttachments类)记录了一组注解引线的引出对象（或者点等）。如果是自由的点选位置，可按照上述生成IpfcFreeAttachment的方法生产一个点并加入到Leaders序列里。如果是从图元中引出，则需要生成IpfcParametricAttachment。IpfcParametricAttachment类由CCpfcParametricAttachment类的Create方法生成，其参数inAttachedGeometry为一个IpfcSelection对象，按照前文的说明，可以通过用户的选取获得。插入带引线的注解的代码如下所示：

```vb
Private Function SelectEdge() As IpfcSelection
  Dim selections As CpfcSelections
  Dim selectionOptions As IpfcSelectionOptions
  selectionOptions = (New CCpfcSelectionOptions).Create("edge")
  selectionOptions.MaxNumSels = 1
  selections = asyncConnection.Session.Select(selectionOptions, Nothing)
  SelectEdge = selections.Item(0)
  Return SelectEdge
End Function

Public Sub CreateNoteWithLeader(ByVal Texts As String)
  Dim model As IpfcModel
  Dim drawing As IpfcDrawing
  Dim selectedEdge As IpfcSelection '选择获取一个边
  Dim leader As IpfcParametricAttachment
  Dim allAttachments As IpfcDetailLeaders
  Dim position As IpfcFreeAttachment
  Dim textLines As CpfcDetailTextLines
  Dim noteInstructions As IpfcDetailNoteInstructions
  Dim note As IpfcDetailNoteItem
  Dim attachments As CpfcAttachments
  If Isdrawding() = True Then
    model = asyncConnection.Session.CurrentModel
    drawing = CType(model, IpfcDrawing)
    textLines = StrstoTextlines(Texts)
    '鼠标左键点选注解放置的位置
    position = MousePosAttatchement()

    '''''''''''''''''''''''''''''''''''''''''''''''''
    '相比自由注解添加的步骤
    '生成一个IpfcParametricAttachment
    selectedEdge = SelectEdge()
    leader = (New CCpfcParametricAttachment).Create(selectedEdge)
    '生成引出对象序列，这里只设置一个
    attachments = New CpfcAttachments
    attachments.Insert(0, leader)
    '''''''''''''''''''''''''''''''''''''''''''''''''
    '设置Attachments
    allAttachments =  (New CCpfcDetailLeaders).Create()
    allAttachments.ItemAttachment = position
    '''''''''''''''''''''''''''''''''''''''''''''''''
    '相比自由注解添加的步骤
    allAttachments.Leaders = attachments
    '''''''''''''''''''''''''''''''''''''''''''''''''
    '设置noteInstructions
    noteInstructions = (New CCpfcDetailNoteInstructions).Create(textLines)
    noteInstructions.Leader = allAttachments
    '创建note并显示
    note = drawing.CreateDetailItem(noteInstructions)
    note.Show()
  End If
End Sub
```
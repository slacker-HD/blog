---
title: Creo二次开发——清除旧版本
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
---


其实这个功能很多人已经做了，我在<a href="https://www.hudi.site/2019/12/23/CREO%20vbapi%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E5%AE%9E%E7%94%A8%E5%B0%8F%E5%B7%A5%E5%85%B7-%E6%89%B9%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7/" target="_blank">CREO vbapi二次开发-实用小工具-批处理工具</a>
以及<a href="https://github.com/slacker-HD/creo_toolkit/tree/master/CreoTool" target="_blank">CREO Toolkit工具</a>均有功能实现并公开了代码。




```vb
Option Explicit
' 在窗体代码顶部添加 API 声明
Private Declare Function PathIsDirectory Lib "shlwapi.dll" Alias "PathIsDirectoryA" (ByVal pszPath As String) As Long
' 引用 Shell 类型库，用于将文件移动到回收站
Private Declare Function SHFileOperation Lib "shell32.dll" Alias "SHFileOperationA" (lpFileOp As SHFILEOPSTRUCT) As Long

' 定义 SHFILEOPSTRUCT 结构体
Private Type SHFILEOPSTRUCT
  hWnd As Long
  wFunc As Long
  pFrom As String
  pTo As String
  fFlags As Integer
  fAnyOperationsAborted As Boolean
  hNameMappings As Long
  lpszProgressTitle As String
End Type

' 定义常量
Private Const FO_DELETE = &H3
Private Const FOF_ALLOWUNDO = &H40
Private Const FOF_NOCONFIRMATION = &H10 ' 禁止确认对话框

Sub DeleteOldFiles(ByVal FolderPath As String)
  Dim FileName As String
  Dim FileList As New Collection
  Dim FileParts() As String
  Dim FileBase As String
  Dim FileNumber As Long
  Dim MaxNumber As Long
  Dim MaxFileName As String
  Dim Item As Variant
  Dim i As Long
  
  ' 确保文件夹路径以反斜杠结尾
  If Right(FolderPath, 1) <> "\" Then
    FolderPath = FolderPath & "\"
  End If
  
  ' 获取文件夹下的所有文件
  FileName = Dir(FolderPath & "*.*")
  Do While FileName <> ""
    ' 检查文件名是否符合 文件名.后缀名.数字 格式
    FileParts = Split(FileName, ".")
    If UBound(FileParts) >= 2 Then
      If IsNumeric(FileParts(UBound(FileParts))) Then
        ' 提取文件名和数字
        FileBase = Left(FileName, Len(FileName) - Len(FileParts(UBound(FileParts))) - 1)
        FileNumber = CLng(FileParts(UBound(FileParts)))
        
        ' 检查是否已经有相同文件名的文件
        Dim Found As Boolean
        Found = False
        For Each Item In FileList
          If Left(Item, Len(FileBase)) = FileBase Then
            Dim ItemParts() As String
            ItemParts = Split(Item, ".")
            Dim ItemNumber As Long
            ItemNumber = CLng(ItemParts(UBound(ItemParts)))
            If FileNumber > ItemNumber Then
              ' 删除数字较小的文件
              MoveToRecycleBin FolderPath & Item
              ' 替换集合中的文件名
              Item = FileName
            Else
              ' 删除当前文件
              MoveToRecycleBin FolderPath & FileName
            End If
            Found = True
            Exit For
          End If
        Next Item
        
        If Not Found Then
          ' 如果没有相同文件名的文件，添加到集合中
          FileList.Add FileName
        End If
      End If
    End If
    FileName = Dir
  Loop
End Sub

Sub MoveToRecycleBin(ByVal FilePath As String)
  Dim FileOp As SHFILEOPSTRUCT
  FileOp.hWnd = 0
  FileOp.wFunc = FO_DELETE
  FileOp.pFrom = FilePath & vbNullChar
  FileOp.pTo = vbNullString
  ' 组合标志，允许移动到回收站且不弹出确认对话框
  FileOp.fFlags = FOF_ALLOWUNDO Or FOF_NOCONFIRMATION
  FileOp.fAnyOperationsAborted = False
  FileOp.hNameMappings = 0
  FileOp.lpszProgressTitle = vbNullString
  
  SHFileOperation FileOp
End Sub

Private Sub Form_Load()
  Me.OLEDropMode = vbOLEDropManual
End Sub

Private Sub Form_Paint()
  Dim text As String
  text = "拖动要处理的文件夹到此处"  ' 要居中的文字
  
  ' 计算居中坐标（ScaleWidth/Height自动适配单位）
  Me.CurrentX = (Me.ScaleWidth - Me.TextWidth(text)) / 2
  Me.CurrentY = (Me.ScaleHeight - Me.TextHeight(text)) / 2
  
  Me.Print text  ' 绘制文字
End Sub

Private Sub Form_Resize()
  Me.Refresh  ' 窗体大小变化时强制重绘
End Sub

' 拖放事件处理
Private Sub Form_OLEDragDrop(Data As DataObject, Effect As Long, Button As Integer, Shift As Integer, X As Single, Y As Single)
  On Error Resume Next ' 防止无效路径导致崩溃
  Dim vFile As Variant
  Dim sPath As String
  Dim sResult As String
  
  ' 遍历所有拖放的路径
  For Each vFile In Data.Files
    sPath = vFile
    
    ' 判断类型
    If PathIsDirectory(sPath) Then
      DeleteOldFiles (sPath)
    End If
  Next vFile
  MsgBox "操作已完成。", vbExclamation
End Sub
```

```vb
Option Explicit

Dim fso, folder, files, file, fileInfo, baseName, numberPart
Dim fileDict
Set fso = CreateObject("Scripting.FileSystemObject")
Set folder = fso.GetFolder(".")
Set files = folder.Files
Set fileDict = CreateObject("Scripting.Dictionary")

' 遍历当前文件夹下的所有文件
For Each file In files
  If IsValidFileName(file.Name) Then
    baseName = GetBaseName(file.Name)
    numberPart = GetNumberPart(file.Name)
    ' 如果字典中不存在该基础文件名，则添加
    If Not fileDict.Exists(baseName) Then
      fileDict.Add baseName, Array(file.Path, numberPart)
    Else
      ' 如果当前文件的数字大于字典中记录的数字
      If numberPart > CInt(fileDict(baseName)(1)) Then
        ' 将之前记录的文件移动到回收站
        MoveToRecycleBin fileDict(baseName)(0)
        ' 更新字典记录
        fileDict(baseName) = Array(file.Path, numberPart)
      Else
        ' 将当前文件移动到回收站
        MoveToRecycleBin file.Path
      End If
    End If
  End If
Next

' 检查文件名是否符合 “文件名.后缀名.数字” 格式
Function IsValidFileName(fileName)
  Dim pattern
  pattern = "^.*\.\w+\.\d+$"
  Dim re
  Set re = New RegExp
  re.Pattern = pattern
  IsValidFileName = re.Test(fileName)
End Function

' 获取文件名的基础部分（去掉最后的数字部分）
Function GetBaseName(fileName)
  Dim parts
  parts = Split(fileName, ".")
  ReDim Preserve parts(UBound(parts) - 1)
  GetBaseName = Join(parts, ".")
End Function

' 获取文件名中的数字部分
Function GetNumberPart(fileName)
  Dim parts
  parts = Split(fileName, ".")
  GetNumberPart = CInt(parts(UBound(parts)))
End Function

' 将文件移动到回收站
Sub MoveToRecycleBin(filePath)
  Dim shell
  Set shell = CreateObject("Shell.Application")
  shell.Namespace(10).MoveHere filePath
End Sub
```


```powershell
# 定义函数，检查文件名是否符合 “文件名.后缀名.数字” 格式
function IsValidFileName {
  param (
    [string]$fileName
  )
  $pattern = '^.*\.\w+\.\d+$'
  return $fileName -match $pattern
}

# 定义函数，获取文件名的基础部分（去掉最后的数字部分）
function GetBaseName {
  param (
    [string]$fileName
  )
  $parts = $fileName.Split('.')
  $newParts = $parts[0..($parts.Length - 2)]
  return $newParts -join '.'
}

# 定义函数，获取文件名中的数字部分
function GetNumberPart {
  param (
    [string]$fileName
  )
  $parts = $fileName.Split('.')
  return [int]$parts[-1]
}

# 定义函数，将文件移动到回收站
function MoveToRecycleBin {
  param (
    [string]$filePath
  )
  $shell = New-Object -ComObject Shell.Application
  $recycleBin = $shell.Namespace(10)
  $item = $shell.Namespace((Get-Item $filePath).Directory.FullName).ParseName((Get-Item $filePath).Name)
  $recycleBin.MoveHere($item)
}

# 主程序逻辑
$fileDict = @{}

# 获取当前文件夹下的所有文件
$files = Get-ChildItem -Path . -File

# 遍历当前文件夹下的所有文件
foreach ($file in $files) {
  if (IsValidFileName $file.Name) {
    $baseName = GetBaseName $file.Name
    $numberPart = GetNumberPart $file.Name
    
    # 如果字典中不存在该基础文件名，则添加
    if (-not $fileDict.ContainsKey($baseName)) {
      $fileDict[$baseName] = @($file.FullName, $numberPart)
    } else {
      # 如果当前文件的数字大于字典中记录的数字
      if ($numberPart -gt $fileDict[$baseName][1]) {
        # 将之前记录的文件移动到回收站
        MoveToRecycleBin $fileDict[$baseName][0]
        # 更新字典记录
        $fileDict[$baseName] = @($file.FullName, $numberPart)
      } else {
        # 将当前文件移动到回收站
        MoveToRecycleBin $file.FullName
      }
    }
  }
}

```
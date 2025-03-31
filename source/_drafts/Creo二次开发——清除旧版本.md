---
title: Creo二次开发——清除旧版本
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
---


其实这个功能很多人已经做了，我在<a href="https://www.hudi.site/2019/12/23/CREO%20vbapi%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E5%AE%9E%E7%94%A8%E5%B0%8F%E5%B7%A5%E5%85%B7-%E6%89%B9%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7/" target="_blank">CREO vbapi二次开发-实用小工具-批处理工具</a>
以及<a href="https://www.hudi.site/2019/11/01/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91%E5%B0%8F%E5%B7%A5%E5%85%B7-%E4%B8%80%E9%94%AE%E6%B8%85%E9%99%A4%E5%B7%A5%E4%BD%9C%E7%9B%AE%E5%BD%95%E4%B8%8B%E6%97%A7%E7%89%88%E6%9C%AC%E6%96%87%E4%BB%B6/" target="_blank">CREO Toolkit二次开发小工具-一键清除工作目录下旧版本文件
</a>均有功能实现并公开了代码，但是似乎是此功能大部分人都是集成到开发的系统中了，很多人还经常问要这个功能，所以索性给出几个单独的解决方案，用VB6、VBS和PowerShell分别完成，也没什么好说明的，就是比较文件后缀名删除小版本的，纯苦力活，直接给出代码。

以下是VBS代码，保存为clean.vbs文件到需要清理的文件夹下，双击运行即可：

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

以下PowerShell代码是用AI改写的，测试了下，保存为`Clean.ps1`到当前文件夹，运行也可实现同样的功能。

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

VB6稍微复杂点，同时实现遍历子文件夹并删除的功能，关键代码和VBS的类似，就不写了，最终直接把文件夹拖动到程序窗体内即可。

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
至于程序可在<a href="http://hudi.ysepan.com" target="_blank">我的永硕E盘</a>下载。

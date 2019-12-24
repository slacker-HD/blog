---
title: CREO Toolkit二次开发-集成Access.md
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 
---

尽管微软已经开始边缘化Access，但是Access作为单机小数据库来说，仍有其自身的优势，本文还是介绍下如何在Toolkit二次开发使用Access，数据库采用ADO接口进行访问。

## 1.环境准备

新版Office虽然集成了Access，但是已弱化了相关功能，自Office 2010开始，如果需要使用ADO访问Access，还需要下载<a href="https://www.microsoft.com/zh-cn/download/confirmation.aspx?id=13255" target="_blank">Microsoft Access 2010 数据库引擎可再发行程序包</a>，该程序同样适用于Access 2013和Access 2016。

## 2.配置工程

工程配置和普通工程一致，在Stdafx.h加入以下代码，注意根据编译是X64和X86以及系统实际选择正确的库文件路径即可：

```cpp
#import "C:\\Program Files\\Common Files\\System\ado\\msado15.dll" no_namespace  rename("EOF", "adoEOF")
```

## 3. 关键源码

配置好后项目和普通的MFC程序访问数据库代码没有任何差别，直接给出连接数据库和读取数据库的代码：

```cpp
_ConnectionPtr m_pConnection;

try
{
  m_pConnection.CreateInstance("ADODB.Connection");
  m_pConnection->ConnectionTimeout = 3;
  CSpath = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=test.accdb;";
  m_pConnection->Open((_bstr_t)CSpath, "", "", adModeUnknown);
}
catch (_com_error e)
{
  return 0;
}

void ReadAccess()
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  _RecordsetPtr m_pRecordset;
  m_pRecordset.CreateInstance(__uuidof(Recordset));
  _variant_t value;
  try
  {
    m_pRecordset->Open(_variant_t("SELECT test FROM Tab WHERE ID=1"), m_pConnection.GetInterfacePtr(), adOpenDynamic, adLockOptimistic, adCmdText);
    _variant_t var = (long)0;
    value = m_pRecordset->GetCollect(var);
    AfxMessageBox(CString(value));
    m_pRecordset->Close();
  }
  catch (_com_error e)
  {
  }
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。

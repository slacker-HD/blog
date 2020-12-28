---
title: CREO Toolkit二次开发-自动排图
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
---

这是之前做项目遇到的一个需求，将当前工作目录下所有的绘图文件放到一个新建绘图文件中的新sheet并保存，便于去排图打印。该需求是一个典型宏和代码配合编程才能实现的功能，在此做一个说明。

将磁盘上其它的绘图文件插入到当前绘图文件中的功能Toolkit未提供函数实现，所以只能用宏去实现。枚举文件的功能只能通过代码实现。梳理个功能的实现方式和业务流程后，初步总结自动排图的流程如下图所示（图中备注了各流程的实现方式）：

<div align="center">
    <img src="/img/proe/zdpt.png" style="width:35%" align="center"/>
    <p>图 自动排图流程</p>
</div>

对上述流程的每一步进行说明。

## 1. 枚举绘图文件

功能很简单，只需要调用ProFilesList函数即可：

```cpp
ProError status;
ProPath *file_list, *dir_list;
ProPath currentpath;
status = ProDirectoryCurrentGet(currentpath);
status = ProFilesList(currentpath, L"*.drw", PRO_FILE_LIST_LATEST, &file_list, &dir_list);
```

## 2. 新建绘图文件并打开

新建绘图文件用于插入绘图文件通过代码执行。ProFileSave打开保存对话框确定获得文件名，ProMdlfileCopy将第一个文件复制至ProFileSave返回结果。

```cpp
ProPath savepath;
status = ProFileSave(NULL, filter, NULL, NULL, NULL, NULL, savepath);
status = ProMdlfileCopy(PRO_MDL_DRAWING, file_list[0], savepath);
```

打开新建的文件通过宏或代码的方式都可以实现，这里用宏实现，，注意在宏里面目录使用两个反斜杠
表示，需要处理下：

```cpp
filename = CString(savepath);
filename.Replace(_T("\\"), _T("\\\\"));
macro = _T("~ Command `ProCmdModelOpen` ;~ Trail `UI Desktop` `UI Desktop` `DLG_PREVIEW_POST` `file_open`;~ Update `file_open` `Inputname` `" + filename + "`;~ Trail `UI Desktop` `UI Desktop` `PREVIEW_POPUP_TIMER` `file_open:Ph_list.Filelist:<NULL>`;~ Command `ProFileSelPushOpen@context_dlg_open_cmd`;");
```

## 3. 新建绘图文件并打开

插入绘图文件到新sheet需要用宏表示。前面已经枚举了所有绘图文件，所以只需要循环插入对应的宏即可：

```cpp
for (int i = 1; i < n_files; i++)
{
  CString tmp = CString(file_list[i]);
  tmp.Replace(_T("\\"), _T("\\\\"));
  macro += _T("~ Command `ProCmdDwgImpAppend` ;~ Trail `UI Desktop` `UI Desktop` `DLG_PREVIEW_POST` `file_open`;~ Update `file_open` `Inputname` `") + tmp + _T("`;~ Command `ProFileSelPushOpen@context_dlg_open_cmd`;");
}
```

## 4.收尾工作

宏字符串拼接完毕后，可以直接运行。增加一个最后弹出对话框的提示，还是按照以前的方式：

```cpp
macro += _T("~ Command `About_Act`;");
hint = Fun;
wchar_t *p = macro.AllocSysString();
ProMacroLoad(p);
SysFreeString(p);

ProError ShowDialog(wchar_t *Message)
{
  ProUIMessageButton *buttons;
  ProUIMessageButton user_choice;
  ProArrayAlloc(1, sizeof(ProUIMessageButton), 1, (ProArray *)&buttons);
  buttons[0] = PRO_UI_MESSAGE_OK;
  ProUIMessageDialogDisplay(PROUIMESSAGE_INFO, L"提示", Message, buttons, PRO_UI_MESSAGE_OK, &user_choice);
  ProArrayFree((ProArray *)&buttons);
  return PRO_TK_NO_ERROR;
}

void about()
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  if (hint == Fun)
  {
    ShowDialog(L"自动排图结束。");
  }
  else
  {
    ShowDialog(L"用于自动排图。\n访问我的博客获取更多信息：\nhttp://www.hudi.site");
  }
  hint = About;
}
```

最终效果如下所示：

<div align="center">
    <img src="/img/proe/zdpt.gif" style="width:80%" align="center"/>
    <p>图 自动排图</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。

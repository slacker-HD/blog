---
title: CREOToolkit二次开发-使用装配树重命名装配体中零件
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

Creo一直没有开发不打开组件直接在装配体中重命名组件的功能，其实原因也很现实，并不是没有能力开发，而是存在以下隐患：

> 1.重命名组件的同时不知道组件对应的工程图是否存在，如果只重命名组件，会导致对应的工程图无法找到组件发生错误；  
> 2.重命名组件后必须要保存下当前装配体，如忘记保存则下次再打开装配体仍是按原来组件的名称去寻找组件，导致装配体找不到组件的错误；  
> 3.同样的如果有其它的装配体也引用了该组件并未同时修改，则其它的装配体也会发生找不到组件的错误，特别是有子装配体同时引用了同一组件的情况。  

因此本文开发的功能默认如下操作：

> 1.重命名组件的同时默认同时重命名组件所在目录下同名工程图（如果存在）,其余的情况不考虑；  
> 2.重命名组件后默认完成保存组件的装配体；  
> 3.不考虑有其它的装配体也引用了该组件的情况。  

## 1.UI接口

重命名最快也是最直接的方式是在装配树中右键增加重命名的菜单。添加右键菜单之前的文章中已叙述过，在此不在赘述，注意通过追踪文件得到在装配体树中点右键菜单的菜单名为`ActionMenu`，通过`ProCmdActionAdd`添加响应函数，`ProMenubarmenuPushbuttonAdd`添加右键菜单：

```cpp
ProError AsmTreePrtinAsmRenamePopupmenusSetup()
{
  ProError status;
  uiCmdCmdId rename_cmd_id;
  status = ProCmdActionAdd("IMI_PrtinAsmRename", (uiCmdCmdActFn)renameMdlinAsm, uiProe2ndImmediate, renameMdlAccess, PRO_B_FALSE, PRO_B_FALSE, &rename_cmd_id);
  status = ProMenubarmenuPushbuttonAdd("ActionMenu", "IMI_PRTinAsmRename_Act", "IMI_RenamePrtinAsm", "IMI_RenamePrtinAsmtips", NULL, PRO_B_TRUE, rename_cmd_id, MSGFILE);
  return PRO_TK_NO_ERROR;
}
```

由于装配树中还有可能存在如基准轴、坐标系等非组件的元素，所以在`ProCmdActionAdd`函数中添加过滤函数`renameMdlAccess`，确保只有选中`Prt`或`Asm`才能响应。在装配体树中右键点击后Creo完成显示菜单的同时还进行了选取的操作，所以只有在当前Selbuffer只有一个而且是`Prt`或`Asm`才能进行显示或响应，直接给出代码：

```cpp
uiCmdAccessState renameMdlAccess(uiCmdAccessMode mode)
{
  uiCmdAccessState access_result;
  ProError status;
  ProSelection *sels;
  int size;

  access_result = ACCESS_REMOVE;

  status = ProSelbufferSelectionsGet(&sels);
  if (status != PRO_TK_NO_ERROR)
    return access_result;

  status = ProArraySizeGet(sels, &size);
  if (status != PRO_TK_NO_ERROR)
    return access_result;

  if (size == 1)
  {
    ProAsmcomp asmcomp;
    status = ProSelectionModelitemGet(sels[0], &asmcomp);
    if (asmcomp.type == PRO_FEATURE)
    {
      ProFeattype ftype;
      status = ProFeatureTypeGet(&asmcomp, &ftype);
      if (ftype == PRO_FEAT_COMPONENT)
      {
        access_result = ACCESS_AVAILABLE;
      }
    }

    if (asmcomp.type == PRO_PART || asmcomp.type == PRO_ASSEMBLY)
    {
      ProAsmcomppath path;
      status = ProSelectionAsmcomppathGet(sels[0], &path);
      if (path.table_num > 0)
      {
        access_result = ACCESS_AVAILABLE;
      }
    }
  }
  ProSelectionarrayFree(sels);
  return access_result;
}
```

## 2.重命名组件及同名工程图

重命名文件的操作其实是常规操作了。可使用`ProMdlDataGet`函数可获得选中组件的详细信息，包括模型名称、所在路径等，之后利用`ProMdlRetrieve`、`ProMdlRename`、`ProMdlSave`三个函数即可完成打开模型、重命名和保存的操作即可。需要注意的几个问题是:

> 1.组件不一定与当前装配体保存在一目录，所以需要用`ProMdlCurrentGet`和`ProDirectoryChange`切换工作目录防止保存出错；  
> 2.组件重命名保存后应同时当前装配体，防止没有保存关闭后再打开出错。  

直接给出重命名组件及同名工程图代码：

```cpp
ProError renameDrwWithSameName(ProName oldName, ProName newName)
{
  ProError status;
  ProMdlType mdlType = PRO_MDL_DRAWING;
  ProMdl mdl;
  status = ProMdlRetrieve(oldName, mdlType, &mdl);
  if (status == PRO_TK_NO_ERROR)
  {
    status = ProMdlRename(mdl, newName);
    status = ProMdlSave(mdl);
  }
  return status;
}

ProError renameMdlinAsm()
{
  ProError status;
  ProSelection *sels;
  ProFeature asmcomp;
  ProMdl asm;
  ProMdldata mdldata;
  ProPath currentPath;
  ProName newName;

  status = ProSelbufferSelectionsGet(&sels);
  status = ProSelectionModelitemGet(sels[0], &asmcomp);

  if (asmcomp.type == PRO_PART || asmcomp.type == PRO_ASSEMBLY)
  {
    status = ProMessageDisplay(MSGFILE, "IMI_Enter_New_Name");
    status = ProMessageStringRead(PRO_NAME_SIZE, newName);

    if (status == PRO_TK_NO_ERROR)
    {
      status = ProMdlCurrentGet(&asm);

      status = ProMdlDataGet(asmcomp.owner, &mdldata);
      status = ProDirectoryCurrentGet(currentPath);
      status = ProDirectoryChange(mdldata.path);

      status = renameDrwWithSameName(mdldata.name, newName);
      status = ProMdlRename(asmcomp.owner, newName);
      status = ProMdlSave(asmcomp.owner);

      status = ProMdlDataGet(asm, &mdldata);
      status = ProDirectoryChange(mdldata.path);
      status = ProMdlSave(asm);

      status = ProDirectoryChange(currentPath);
    }
    ProSelectionarrayFree(sels);
  }
  return PRO_TK_NO_ERROR;
}
```

<div align="center">
    <img src="/img/proe/ToolkitRenameinAsm.gif" style="width:75%" align="center"/>
    <p>图 右键重命名组件</p>
</div>


代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

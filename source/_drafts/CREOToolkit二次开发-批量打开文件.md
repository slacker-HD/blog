---
title: CREO Toolkit二次开发-批量打开文件
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

批量打开当前工作目录下的所有文件在weblink中已经开发过了，思路是使用`ProFilesList`函数先获目录下对应的所有文件，之后打开对应的文件即可。但是Creo一次打开窗口的个数是有限制的，所以需要注意不要在包含大量文件的工作目录下执行次操作。给出关键代码：
```cpp
void _openFilesByType(wchar_t *filter, ProMdlType mdltype)
{
    ProError status;
    ProPath *file_list, *dir_list, r_path;
    int i, n_files;
    ProMdl mdl;
    int new_win_id;
    ProName r_file_name, r_extension;
    ProFileName f_file_name;
    int r_version;
    status = ProArrayAlloc(0, sizeof(ProPath), 1, (ProArray *)&file_list);
    status = ProArrayAlloc(0, sizeof(ProPath), 1, (ProArray *)&dir_list);
    status = ProFilesList(NULL, filter, PRO_FILE_LIST_LATEST, &file_list, &dir_list);
    if (status == PRO_TK_NO_ERROR)
    {
        status = ProArraySizeGet((ProArray)file_list, &n_files);
        if (n_files > 0)
        {
            for (i = 0; i < n_files; i++)
            {
                memset(f_file_name, '\0', sizeof(ProFileName));
                status = ProFilenameParse(file_list[i], r_path, r_file_name, r_extension, &r_version);
                status = ProWstringConcatenate(r_file_name, f_file_name, PRO_VALUE_UNUSED);
                status = ProWstringConcatenate(L".", f_file_name, PRO_VALUE_UNUSED);
                status = ProWstringConcatenate(r_extension, f_file_name, PRO_VALUE_UNUSED);
                status = ProMdlLoad(f_file_name, PRO_MDL_UNUSED, PRO_B_FALSE, &mdl);
                status = ProObjectwindowCreate(f_file_name, mdltype, &new_win_id);
                status = ProMdlDisplay(mdl);
            }
        }
    }
    status = ProArrayFree((ProArray *)&file_list);
    status = ProArrayFree((ProArray *)&dir_list);
}
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

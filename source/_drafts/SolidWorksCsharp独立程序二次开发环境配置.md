---
title: SolidWorks C#独立程序二次开发环境配置
tags:
  - Solidworks
  - C#
  - Solidworks二次开发
comments: true
category: Solidworks二次开发
---

本文主要尝试搭建Solidworks C# 独立二次开发环境配置。具体二次开发的相关代码撰写还得边学编总结。

## 1.开发环境介绍

首先安装好Visual Studio和对应的.Net FrameWork 4.8版本，Solidworks二次开发包也要确保安装，总体和之前的addin模式环境一致：

- 主机操作系统：Windows 11 X64
- Visual Studio版本：Visual Studio 2026 社区版
- Solidworks版本：2020 X64
- .Net版本：.Net FrameWork 4.8
  
## 2. Visual Studio工程设置

独立程序只要添加引用即可，不需要修改其“嵌入互操作类型 (Embed Interop Types)”属性设为False。刚开始开发，只用添加**Solidworks.Interop.sldworks.dll、Solidworks.Interop.swconst.dll、Solidworks.Interop.swpublished.dll**三个核心库：

<div align="center">
    <img src="/img/solid/Soild3.png" style="width:50%" align="center"/>
    <p>图3 添加Solidworks引用</p>
</div>


## 3. 代码撰写

独立开发的代码其实就很简单了，无非是创建对象，调用相关对象进行操作，直接给出建立实例并打开文件的代码:


```c#
using SolidWorks.Interop.sldworks;
using System;
using System.Windows.Forms;

namespace SampleExe
{
    public partial class FrmMain : Form
    {
        // 全局SolidWorks实例，整个窗体生命周期共用
        private SldWorks _swApp = null;

        public FrmMain()
        {
            InitializeComponent();
        }

        private void FrmMain_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (_swApp != null)
            {
                try
                {
                    // 退出SolidWorks程序
                    _swApp.ExitApp();
                    // 释放COM资源
                    System.Runtime.InteropServices.Marshal.ReleaseComObject(_swApp);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"关闭SolidWorks异常：{ex.Message}", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
                finally
                {
                    _swApp = null;
                }
            }
        }

        private void BtnOpen_Click(object sender, EventArgs e)
        {
            // 初始化打开文件对话框
            OpenFileDialog openFileDialog1 = new OpenFileDialog();
            // 筛选后缀*.prt;*.asm;*.drw;*.sldprt;*.sldasm;*.slddrw
            openFileDialog1.Filter = "SolidWorks文件(*.prt;*.asm;*.drw;*.sldprt;*.sldasm;*.slddrw)|*.prt;*.asm;*.drw;*.sldprt;*.sldasm;*.slddrw|所有文件(*.*)|*.*";
            openFileDialog1.Title = "选择SolidWorks零件/装配/工程图文件";

            // 判断是否选中文件并点击确定
            if (openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                // 获取选中文件完整路径
                string filePath = openFileDialog1.FileName;
                int error = 0;
                int warning = 0;

                // 如果实例不存在才新建，避免重复启动多个SW进程
                if (_swApp == null)
                {
                    _swApp = new SldWorks();
                }

                // 根据文件后缀自动匹配文档类型（OpenDoc6第二个参数）
                int docType;
                string ext = System.IO.Path.GetExtension(filePath).ToLower();
                switch (ext)
                {
                    case ".prt":
                    case ".sldprt":
                        docType = 1; // swDocPART 零件
                        break;
                    case ".asm":
                    case ".sldasm":
                        docType = 2; // swDocASSEMBLY 装配体
                        break;
                    case ".drw":
                    case ".slddrw":
                        docType = 3; // swDocDRAWING 工程图
                        break;
                    default:
                        MessageBox.Show("不支持的文件格式！");
                        return;
                }

                // 打开文档
                _swApp.OpenDoc6(filePath, docType, 1, "", ref error, ref warning);
                _swApp.Visible = true;

                if (error != 0)
                {
                    MessageBox.Show($"打开失败，错误码：{error}");
                }
            }
        }
    }
}
```

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。

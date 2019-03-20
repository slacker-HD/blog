---
title: CREO Toolkit二次开发-Dashboard实例
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-01-28 
---

Creo Toolkit二次开发界面目前市面常见教程多是使用MFC（也有QT等）以及原生对话框制作界面。使用对话框存在一些麻烦，例如如果是使用非模式对话框，执行操作时需要判断当前Creo窗体是否已切换，否则会出错；而使用模式对话框时，Creo的交互完全被打断。

Creo提供了一个名为仪表盘（Dashboard）的方式解决了上面的问题。对于Dashboard，官方帮助文档解释如下：

> A dashboard consists of the following components:  
> •  A main dialog bar, which show the commonly used commands and entry fields. You perform most of your modeling tasks in thegraphics window and the dialog bar. When you activate a tool, the dialog bar displays commonly used options and collectors.  
> •  Standard buttons for controlling the tool.  
> •  Slide-down panels that open to reveal less commonly-used functionality. You can use them to perform advanced modeling actionsor retrieve comprehensive feature information. 
> •  A bitmap identifies the tool (typically the same icon used on buttons that invoke the tool).  
>  
> Creo Parametric uses the dashboard to create features that involve extensive interaction with user interface components and geometry manipulation.You can use dashboards in Creo Parametric TOOLKIT applications:  
> •  Where a dialog box is too large in size or is intrusive onto the graphics window. Dashboards enable you to make a smooth-flowtool.  
> •  To present a streamlined "simple-user" activity with more complicated actions available to "expert users".  
> •  Where Creo Parametric TOOLKIT dashboards are not only limited to feature creation activities and solid model modes.  

一个典型的Dashboard如图1所示：

<div align="center">
    <img src="/img/proe/dashboard1.png" style="width:60%" align="center"/>
    <p>图1 Dashboard</p>
</div>

Dialog Bar和Slide-down Panels与原生对话框制作过程相同，通过写res文件的方式完成。而Standard Buttons官方文档给出说明，目前（Creo2.0）暂时无法设置：

> Creo Parametric TOOLKIT does not currently provide access to create the feature dashboard’s standard buttons. However, you can use ProUIDashboardStdlayoutGet() to get the layout name where you can create and place the buttons in the standard button area. Typically this consists of(at least) OK and Cancel buttons.  

使用DashBoard就是设定好Dialog Bar和Slide-down Panels及其对应的响应操作函数即可。

## 1. 设定Dialog Bar

如前文所述，Dialog Bar和原生对话框一样，通过写res文件的方式。本文仅做一个简单的实例，故只添加了一个按钮。此外，由于Standard Buttons暂时无法实现，故在Dialog Bar中添加了"确定"和"取消"两个按钮。res文件如下所示：

```
(Layout mainpage
  (Components
    (PushButton                     ok_btn)
    (PushButton                     cancel_btn)
    (Separator                      Separator1)
    (Separator                      Separator2)
    (SubLayout                      Layout1)
  )

  (Resources
    (ok_btn.Bitmap              "cl_ok")
    (ok_btn.HelpText            "Complete and exit")
    (ok_btn.ButtonStyle         3)
    (ok_btn.AttachRight         True)
    (cancel_btn.Bitmap          "cl_cancel")
    (cancel_btn.HelpText        "Cancel and exit")
    (cancel_btn.ButtonStyle     3)
    (cancel_btn.AttachRight     True)
    (Separator1.Orientation         True)
    (Separator1.AttachLeft          False)
    (Separator1.TopOffset           0)
    (Separator1.BottomOffset        0)
    (Separator1.LeftOffset          0)
    (Separator1.RightOffset         0)
    (Separator2.Orientation         True)
    (Separator2.AttachLeft          False)
    (Separator2.TopOffset           0)
    (Separator2.BottomOffset        0)
    (Separator2.LeftOffset          0)
    (Separator2.RightOffset         0)
      (.Label                         "这个是对话框标题")
      (.Layout
        (Grid (Rows 1) (Cols 1 0 0 0 0)
          Layout1
          Separator1
          ok_btn
          Separator2
          cancel_btn
        )
      )
    )
  )

  (Layout Layout1
    (Components
      (PushButton                     msg_btn)
    )
    (Resources
    (.Resizeable           True)
    (msg_btn.Label          "这是mainpage的测试按钮")
    (.Layout
      (Grid (Rows 1) (Cols  1)
        msg_btn
      )
    )
  )
)
```

初始化Dialog Bar主要包含以下三个内容：

1. 初始化Dialog Bar对应的ProUIDashboardPageOptions;
2. 设置Dialog Bar对应的Notification，响应Dialog Bar的事件;
3. 设置Dialog Bar窗体各控件的响应函数。  

初始化Dialog Bar对应的ProUIDashboardPageOptions主要由ProUIDashboardpageoptionsAlloc进行,可以设定Dialog Bar对应的名称、资源文件及各选项，示例代码如下：

```c
static ProError DashboardMainPageSetup(ProAppData data, ProUIDashboardPage *page_options, char *page_name, char *resource_name)
{
  ProUIDashboardPage opts;
  ProError status;
  status = ProUIDashboardpageoptionsAlloc(page_name, resource_name, data, &opts);
  status = ProUIDashboardpageoptionsNotificationSet(opts, (ProUIDashboardpageCallbackFunction)MainPageNotification, data);
  *page_options = opts;
  return PRO_TK_NO_ERROR;
}

ProUIDashboardPageOptions mainpage_options = NULL;
status = DashboardMainPageSetup(NULL, &mainpage_options, "pagename", "mainpage");
```

初始化Dialog Bar对应的ProUIDashboardPageOptions后，必须使用ProUIDashboardpageoptionsNotificationSet设定Dialog Bar各事件的响应函数。Toolkit提供了ProUIDashboardpageCallbackFunction回调函数实现对各事件的响应，事件的类型可从官方帮助文档中查询。一般在PRO_UI_DASHBOARD_PAGE_CREATE事件中设定Dialog Bar中各控件的响应函数，与原生对话框的操作一致，在此不做详细说明，直接给出示例代码：

```c
static ProError MainPageNotification(ProUIDashboardPage page, ProUIDashboardPageEventType event_type, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  char *component_name;
  char *name;
  switch (event_type)
  {
  case PRO_UI_DASHBOARD_PAGE_CREATE:
    status = ProUIDashboardpageComponentnameGet(page, "ok_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(mainpage_ok_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    status = ProUIDashboardpageComponentnameGet(page, "cancel_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(mainpage_cancel_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    status = ProUIDashboardpageComponentnameGet(page, "msg_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(mainpage_msg_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_CREATE"));
    break;
  case PRO_UI_DASHBOARD_PAGE_SHOW:
    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_SHOW"));
    break;
  case PRO_UI_DASHBOARD_PAGE_HIDE:
    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_HIDE"));
    break;
  case PRO_UI_DASHBOARD_PAGE_DESTROY:
    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_DESTROY"));
    break;
  default:
    break;
  }
  return PRO_TK_NO_ERROR;
}
```

最后需要设定Dialog Bar各控件的响应函数，其中包括了"确定"和"取消"两个按钮的操作。一般通过ProUIDashboardpageDashboardGet函数返回Dialog Bar输入需要返回的相关信息，ProUIDashboardDestroy关闭Dialog Bar，其余操作方式与原生对话框则完全一致。示例代码如下：

```c
void mainpage_ok_btn(char *dialog, char *component, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  ProUIDashboard db;
  AfxMessageBox(_T("您点击了确定按钮"));

  status = ProUIDashboardpageDashboardGet(appdata, &db);
  status = ProUIDashboardDestroy(db);
}

void mainpage_cancel_btn(char *dialog, char *component, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  ProUIDashboard db;
  AfxMessageBox(_T("您点击了取消按钮"));

  status = ProUIDashboardpageDashboardGet(appdata, &db);
  status = ProUIDashboardDestroy(db);
}

void mainpage_msg_btn(char *dialog, char *component, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  AfxMessageBox(_T("您点击了mainpage的测试按钮"));
}
```

## 2. Slide-down panels

Slide-down panels是一个可选项，如果不需要，则设置其为NULL即可。由于一个Dashboard可以包含多个Slide-down panel，故Slide-down panels对应的ProUIDashboardPageOptions是一个数组，可分别对数组中的各option其进行初始化即可。每一个Slide-down panel的初始化过程和Dialog Bar基本一致，都是通过ProUIDashboardPageOptions初始化并设定对应的Notification。本文为简单起见，只设置了一个Slide-down panel，示例代码如下：

```c
static ProError DashboardSlidePageSetup(ProAppData data, ProUIDashboardPage *page_options)
{
  ProUIDashboardPage opts;
  ProError status;
  status = ProUIDashboardpageoptionsAlloc("测试slidename", "slide1", data, &opts);
  status = ProUIDashboardpageoptionsNotificationSet(opts, (ProUIDashboardpageCallbackFunction)Slide1Notification, data);
  *page_options = opts;
  return PRO_TK_NO_ERROR;
}

ProUIDashboardPageOptions *slideup_panels = NULL;
status = ProArrayAlloc(1, sizeof(ProUIDashboardPageOptions), 1, (ProArray *)&slideup_panels);
status = DashboardSlidePageSetup(NULL, &slideup_panels[0]);
```

slide1对应的资源文件如下，只设置了一个按钮：

```
(Layout slide1
  (Components
    (SubLayout                      Layout1)
  )

  (Resources
    (.Label                         "这个是对话框标题")
    (.Layout
      (Grid (Rows 1) (Cols 1 0 0 0 0)
        Layout1
      )
    )
  )
)

(Layout Layout1
  (Components
    (PushButton                     msg_btn)
  )
  (Resources
    (.Resizeable           True)
    (msg_btn.Label          "这是slide1的测试按钮")
    (.Layout
      (Grid (Rows 1) (Cols  1)
        msg_btn
      )
    )
  )
)
```

设置slide1对应的Notification代码与Dialog Bar非常相似，这里不再详细说明直接给出代码：

```c
static ProError Slide1Notification(ProUIDashboardPage page, ProUIDashboardPageEventType event_type, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  char *component_name;
  char *name;
  switch (event_type)
  {
  case PRO_UI_DASHBOARD_PAGE_CREATE:
    status = ProUIDashboardpageTitleSet(page, _T("测试slide"));
    status = ProUIDashboardpageComponentnameGet(page, "msg_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(slide1_msg_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    AfxMessageBox(_T("Slide1_PRO_UI_DASHBOARD_PAGE_CREATE"));
    break;
  case PRO_UI_DASHBOARD_PAGE_SHOW:
    AfxMessageBox(_T("Slide1_PRO_UI_DASHBOARD_PAGE_SHOW"));
    break;
  case PRO_UI_DASHBOARD_PAGE_HIDE:
    AfxMessageBox(_T("Slide1_PRO_UI_DASHBOARD_PAGE_HIDE"));
    break;

  case PRO_UI_DASHBOARD_PAGE_DESTROY:
    AfxMessageBox(_T("Slide1_PRO_UI_DASHBOARD_PAGE_DESTROY"));
    break;
  default:
    break;
  }
  return PRO_TK_NO_ERROR;
}

```

slide1对应控件的相应函数代码如下：

```c
void slide1_msg_btn(char *dialog, char *component, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  AfxMessageBox(_T("您点击了slide1的测试按钮"));
}

```

## 3.设置Dashboard

整个Dashboard的初始化需要通过ProUIDashboardShowOptions变量完成。首先调用ProUIDashboardshowoptionsAlloc确定对应的前文已设定好了Dialog Bar和Slide-down Panels。ProUIDashboardshowoptionsTitleSet设置标题，ProUIDashboardshowoptionsNotificationSet则设定Dashboard对应的事件响应函数。当初始化完成后，只需调用ProUIDashboardShow即可显示Dashboard，代码如下：

```c
ProUIDashboardShowOptions dashboard_options = NULL;
void ShowDashBoard()
{
  ProError status;
  status = DashboardMainPageSetup(NULL, &mainpage_options, "pagename", "mainpage");
  status = ProArrayAlloc(1, sizeof(ProUIDashboardPageOptions), 1, (ProArray *)&slideup_panels);
  status = DashboardSlidePageSetup(NULL, &slideup_panels[0]);
  status = ProUIDashboardshowoptionsAlloc(mainpage_options, slideup_panels, NULL, &dashboard_options);
  status = ProUIDashboardshowoptionsTitleSet(dashboard_options, _T("测试dashboard"));
  status = ProUIDashboardshowoptionsNotificationSet(dashboard_options, (ProUIDashboardCallbackFunction)DashboardNotification, NULL);
  status = ProUIDashboardShow(dashboard_options);
}

status = ProCmdActionAdd("ShowDashboard_Act", (uiCmdCmdActFn)ShowDashBoard, uiProeImmediate, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &RunmacroId);
```

初始化Dashboard与初始化Dialog Bar过程基本一致，主要是调用ProUIDashboardpageoptionsAlloc和ProUIDashboardpageoptionsNotificationSet完成对应的选项，代码如下：

```c
static ProError DashboardMainPageSetup(ProAppData data, ProUIDashboardPage *page_options, char *page_name, char *resource_name)
{
  ProUIDashboardPage opts;
  ProError status;
  status = ProUIDashboardpageoptionsAlloc(page_name, resource_name, data, &opts);
  status = ProUIDashboardpageoptionsNotificationSet(opts, (ProUIDashboardpageCallbackFunction)MainPageNotification, data);
  *page_options = opts;
  return PRO_TK_NO_ERROR;
}
```

Dashboard的响应函数也是通过响应各事件完成，不再详细叙述，直接给出代码：

```c
static ProError MainPageNotification(ProUIDashboardPage page, ProUIDashboardPageEventType event_type, ProAppData appdata)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  char *component_name;
  char *name;
  switch (event_type)
  {
  case PRO_UI_DASHBOARD_PAGE_CREATE:
    status = ProUIDashboardpageComponentnameGet(page, "ok_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(mainpage_ok_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    status = ProUIDashboardpageComponentnameGet(page, "cancel_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(mainpage_cancel_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    status = ProUIDashboardpageComponentnameGet(page, "msg_btn", &component_name);
    status = ProUIDashboardpageDevicenameGet(page, &name);
    status = ProUIPushbuttonActivateActionSet(name, component_name, (ProUIAction)(mainpage_msg_btn), page);
    status = ProStringFree(component_name);
    status = ProStringFree(name);

    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_CREATE"));
    break;
  case PRO_UI_DASHBOARD_PAGE_SHOW:
    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_SHOW"));
    break;
  case PRO_UI_DASHBOARD_PAGE_HIDE:
    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_HIDE"));
    break;
  case PRO_UI_DASHBOARD_PAGE_DESTROY:
    AfxMessageBox(_T("MainPage_PRO_UI_DASHBOARD_PAGE_DESTROY"));
    break;
  default:
    break;
  }
  return PRO_TK_NO_ERROR;
}
```
最终程序运行界面如图2所示。

<div align="center">
    <img src="/img/proe/dashboard2.png" style="width:40%" align="center"/>
    <p>图2 程序运行界面</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
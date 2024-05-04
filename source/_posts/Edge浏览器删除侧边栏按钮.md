---
title: Edge浏览器删除侧边栏按钮
tags:
  - Windows
comments: true
category: 电脑技术
date: 2024-05-04 09:06:36
---



Edge浏览器那个硕大的bing按钮看着实在有点突兀，在网上搜索了一番，将其删除，在此记录：

1、添加注册表项：

> reg add "HKEY_CURRENT_USER\Software\Policies\Microsoft\Edge" /f  
> reg add "HKEY_CURRENT_USER\Software\Policies\Microsoft\Edge" /v "HubsSidebarEnabled" /t REG_DWORD /d 0 /f

2、在edge浏览器中输入`edge://policy/`,确保刚才注册表中设置的策略`HubsSidebarEnabled`的值为`false`。

重启Edge浏览器，此时图标应该删除了。

## 参考网址

[1] <a href="https://answers.microsoft.com/zh-hans/microsoftedge/forum/all/%E5%A6%82%E4%BD%95%E5%85%B3%E9%97%ADedge%E5%B7%A5/ef1ed8de-fd81-4b71-9030-aacd764bfc84" target="_blank">如何关闭Edge工具栏中“侧栏”按钮？
</a>.



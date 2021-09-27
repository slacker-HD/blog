---
title: CREOToolkit二次开发-消息文件及消息提示
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---





## 1.消息文件

### 1.1 消息文件的基础格式



### 1.2 消息文件的前缀

> Creo Parametric TOOLKIT applications can now display any or all of these message symbols:
> • 	Prompt—the Creo Parametric message displayed is preceded by a green arrow. The user must respond to this message type (to either input information, accept the default value offered, or cancel the application). Without such action, no progress can be made. The response may be either textual or in the form of a selection. The classification code for prompt messages is %CP.
> • 	Info—the Creo Parametric message displayed is preceded by a blue dot. This message type contains information such as user requests or feedback from either Creo Parametric or the Creo Parametric TOOLKIT application. The classification code for prompt messages is %CI.
> Note
> Do not classify as Info any message which informs users of a problem with an operation or process. These messages should be classified as Warnings.
> • 	Warning—the Creo Parametric message displayed is preceded by a triangle containing an exclamation point. Warnings alert the user to situations which may lead to potentially erroneous situations at a later stage, for example, possible process restrictions imposed or a suspected data problem. However, warnings do not prevent or interrupt task completion, nor should they be used to indicate a failed operation. Warnings only caution the user that the operation has been completed, but may not have been performed in a completely desirable way. The classification code for prompt messages is %CW.
> • 	Error—the Creo Parametric message is preceded by a broken square. This message type informs the user when a required task was not successfully completed. It may or may not require intervention or correction before work can continue, depending on the application. Whenever possible, provide a path to redress this situation. The classification code for prompt messages is %CE.
> • 	Critical—the Creo Parametric message displayed is preceded by a red X. This message type informs the user of extremely serious situations, especially those which could cause the loss of user data. Options for redressing the situation (if available) should be provided with the message. The classification code for prompt messages is %CC.

| 前缀 | 类型     | 说明                                              |
| ---- | -------- | ------------------------------------------------- |
| %CP  | Prompt   | 提示，提示信息前面添加一个绿色的箭头。            |
| %CI  | Info     | 信息，提示信息前面添加一个蓝色的点。              |
| %CW  | Warning  | 警告，提示信息前面添加一个包含感叹号的三角形。    |
| %CE  | Error    | 错误，提示信息前面添加一个破碎绿色+黄色的正方形。 |
| %CC  | Critical | 严重错误，提示信息前面添加一个红色的×。           |


### 1.3 格式化字符串


| Conversion Character | Data Type                                   | 说明                                   |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| f                    | Float (or double)                           | 浮点型数据并且可以指定格式，如(5.3)f等 |
| d                    | Decimal integer                             | 十进制整数                             |
| s                    | Ordinary string (or type char[])            | 普通字符串（chars数组）                |
| w                    | Wide character strings                      | wchar_t数组                            |
| e                    | Exponential                                 | 指数形式数字，形如2.3e3                |
| g                    | Either float or exponential, as appropriate | 浮点或指数形式的数字均可               |




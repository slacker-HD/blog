---
title: CREO Toolkit二次开发-向轨迹文件写入内容
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

对于大型系统来说，一般使用日志文件用于处理历史数据、诊断问题的追踪以及理解系统的活动。Creo使用轨迹文件记录所有的系统操作，当然也给Toolkit二次开发写入轨迹文件提供了接口。

```cpp
void AddTrail()
{
	ProError status;
	CString c;
	c.Format("点击了测试菜单%d次\n", _count);
	wchar_t *str = c.AllocSysString();
	status = ProTrailfileCommentWrite(str);
	_count++;
	SysFreeString(str);
}
```
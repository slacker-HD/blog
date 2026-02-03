---
title: linux用Shell脚本做一个关机对话框脚本
tags:
  - Linux
  - console
category: Linux
---

用过 Openbox、Fluxbox 这类轻量级窗口管理器的人都清楚，默认菜单里一般都却缺少关机、重启这类系统操作选项。即便手动将这些功能添加到菜单中，使用起来也存在隐患 —— 点击后会直接执行操作，没有任何确认步骤，很容易因误触造成麻烦。为此，写了一个 Shell 脚本，通过对话框的形式实现操作确认，以此来安全地完成关机、重启、锁屏等功能。
脚本使用yad生成对话框，并使用case语句判断用户点击的按钮，执行相应的命令。在 Raspbian 系统中，默认配置下普通用户即可直接执行systemctl reboot这类系统命令；若系统权限限制不同，也可将当前用户添加到sudoers文件中，实现无需输入密码即可执行关机、重启、锁屏等操作。
直接给出代码，需要的自取修改：

```bash
#!/bin/bash
yad --title="关闭计算机" \
    --width=300 --height=80 --center \
    --window-icon=system-shutdown \
    --button="锁定屏幕!gtk-lock!0" \
    --button="重启系统!gtk-refresh!1" \
    --button="立即关机!gtk-quit!2" \
    --text=""

case $? in
    0)
        # 锁定屏幕（适配xscreensaver）
        if command -v xscreensaver-command &>/dev/null; then
            killall -9 xscreensaver >/dev/null 2>&1
            xscreensaver -no-splash >/dev/null 2>&1 &
            sleep 1
            xscreensaver-command -display :0 -lock
        else
            yad --error --title="锁屏失败" --text="未检测到xscreensaver！\n安装：sudo apt install xscreensaver"
        fi
        ;;
    1)
        # 重启系统（免密）
        systemctl reboot
        ;;
    2)
        # 立即关机（免密）
        systemctl poweroff
        ;;
esac
exit 0
```

#!/bin/bash
set -euo pipefail

APP_PATH="/Applications/上传测试文件生成器.app"

echo "== 上传测试文件生成器：macOS 修复并启动 =="
echo "1) 请先确认你已经把 App 从 DMG 拖到了“应用程序”文件夹"
echo "2) 当前将尝试移除隔离标记并启动 App"
echo

if [ ! -d "$APP_PATH" ]; then
  echo "未找到: $APP_PATH"
  echo "请先把 App 拖到“应用程序”后，再双击本脚本。"
  exit 1
fi

xattr -dr com.apple.quarantine "$APP_PATH" || true

if ! open "$APP_PATH"; then
  echo "open 失败，尝试执行临时重签名..."
  codesign --force --deep --sign - "$APP_PATH" || true
  open "$APP_PATH"
fi

echo "完成。若仍被拦截，请在“系统设置 -> 隐私与安全性”里允许打开。"

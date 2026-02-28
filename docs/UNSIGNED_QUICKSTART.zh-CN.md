# macOS 未公证快速安装（先看）

如果你看到“已损坏，无法打开”，通常是系统拦截未公证应用，不是文件真的坏了。

## 推荐步骤

1. 打开 DMG，把 `上传测试文件生成器.app` 拖到“应用程序”。
2. 弹出 DMG，不要在 DMG 窗口里直接双击运行。
3. 在“应用程序”中打开 App（先尝试一次，即使被拦截）。
4. 到“系统设置 -> 隐私与安全性”，点击“仍要打开”。
5. 再次打开 App。

## 若仍提示“已损坏”（终端兜底）

```bash
xattr -dr com.apple.quarantine "/Applications/上传测试文件生成器.app"
open "/Applications/上传测试文件生成器.app"
```

若仍失败，再执行：

```bash
codesign --force --deep --sign - "/Applications/上传测试文件生成器.app"
open "/Applications/上传测试文件生成器.app"
```

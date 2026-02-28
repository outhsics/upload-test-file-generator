# macOS Unsigned Quickstart (Read First)

If you see "App is damaged", it is usually Gatekeeper blocking an unnotarized app, not real corruption.

## Recommended flow

1. Open the DMG and drag `上传测试文件生成器.app` to Applications.
2. Eject the DMG. Do not launch the app directly inside the DMG window.
3. Launch the app from Applications once (it may be blocked).
4. Go to `System Settings -> Privacy & Security` and click `Open Anyway`.
5. Launch the app again.

## If macOS still says "damaged" (terminal fallback)

```bash
xattr -dr com.apple.quarantine "/Applications/上传测试文件生成器.app"
open "/Applications/上传测试文件生成器.app"
```

If still blocked:

```bash
codesign --force --deep --sign - "/Applications/上传测试文件生成器.app"
open "/Applications/上传测试文件生成器.app"
```

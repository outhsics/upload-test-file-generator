# User Guide

## 1. Install

1. Download the `.dmg` that matches your Mac:
   - Apple Silicon (M1/M2/M3/M4): `upload-test-file-generator-macos-arm64.dmg`
   - Intel Mac: `upload-test-file-generator-macos-x64.dmg`
   Also recommended: `*-macos-open-guide-arm64.zip` or `*-macos-open-guide-x64.zip`.
2. Open the DMG and drag `上传测试文件生成器` to Applications.
3. Eject the DMG and do not launch the app directly inside the DMG window.
4. If macOS blocks first launch, allow it in `System Settings -> Privacy & Security`.

## 2. If macOS says "App is damaged"

On non-notarized builds, Gatekeeper may block first launch. Prefer GUI flow:

1. Launch the app from Applications once (even if blocked).
2. Go to `System Settings -> Privacy & Security` and click `Open Anyway`.
3. Launch the app again.

If macOS still says "damaged", run:

```bash
xattr -dr com.apple.quarantine "/Applications/上传测试文件生成器.app"
open "/Applications/上传测试文件生成器.app"
```

If still blocked, run:

```bash
codesign --force --deep --sign - "/Applications/上传测试文件生成器.app"
open "/Applications/上传测试文件生成器.app"
```

## 3. Install ffmpeg

The app uses `ffmpeg` to generate media files:

```bash
brew install ffmpeg
```

Restart the app after installation. The header status should show `ffmpeg：已检测到`.

## 4. Generate Test Files

1. Select output directory (default: `~/Downloads/upload-test-files`).
2. Switch to image/audio/video tab.
3. Configure specs and click generate.
4. Check logs for completion details.

## 5. Quick Presets

- `10MB image`
- `100MB video`
- `500MB audio`

Each preset auto-fills fields and runs generation.

## 6. FAQ

### Q1: `ffmpeg not found`

Install ffmpeg:

```bash
brew install ffmpeg
```

If you installed ffmpeg in a custom path, set `FFMPEG_PATH` to the executable location.

### Q2: Size is not media-exact

`Pad to MB` appends zero bytes to satisfy upload-size testing. For strict media validation backends, prefer controlling file size via bitrate/resolution/duration first.

### Q3: Why does macOS report "damaged app"?

For unsigned/unnotarized builds, this is usually a Gatekeeper block, not true file corruption. Use section 2 commands.

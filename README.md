# 上传测试文件生成器 (Upload Test File Generator)

[中文说明](./README.zh-CN.md) | [User Guide (EN)](./docs/USER_GUIDE.md) | [Homebrew Install](./docs/HOMEBREW.md) | [用户操作指南](./docs/USER_GUIDE.zh-CN.md) | [Signing & Notarization](./docs/RELEASE_SIGNING.md)

Desktop app built with Tauri for generating upload test files at configurable size/specs.

> ⚠️ Public installers are currently unsigned/unnotarized by default. Do not launch the app directly inside the DMG window; drag to Applications first. If blocked, use `Privacy & Security -> Open Anyway` first; use terminal fallback only if needed. See [User Guide section 2](./docs/USER_GUIDE.md).

## Features

- Generate image/audio/video test files for upload testing.
- Configure resolution, duration, fps, bitrate, count, format.
- Optional file padding to target size in MB.
- One-click presets:
  `10MB image`, `100MB video`, `500MB audio`.
- ffmpeg auto-discovery for Homebrew and common macOS paths.
- Built-in onboarding flow when ffmpeg is missing (copy command + recheck).

## Tech Stack

- Tauri v2 (Rust backend + web frontend)
- Vanilla HTML/CSS/JS frontend (easy to customize)
- ffmpeg for media generation

## Quick Start (macOS)

```bash
pnpm install
pnpm run dev
```

## Build

```bash
# macOS arm64 .app + .dmg (Apple Silicon)
pnpm run build:mac

# macOS x64 .app + .dmg (Intel)
pnpm run build:mac:x64

# Windows installer bundle (for CI/Windows runners)
pnpm run build:windows
```

## Icon Styles

Generate and switch icon variants:

```bash
pnpm run icons:generate
python3 scripts/apply_icon.py tech
pnpm tauri icon src-tauri/icons/app-icon.png -o src-tauri/icons
```

Styles:

- `minimal`
- `tech` (default)
- `skeuomorphic`

## Release

Tag-based release workflow builds installers and publishes GitHub Releases:

- macOS arm64 (Apple Silicon): `upload-test-file-generator-macos-arm64.dmg`
- macOS x64 (Intel): `upload-test-file-generator-macos-x64.dmg`
- macOS extra: `*-macos-open-guide-arm64.zip`, `*-macos-open-guide-x64.zip`
- Windows: `.nsis.exe`

Homebrew (auto-arch):

```bash
brew tap outhsics/upload-test-file-generator https://github.com/outhsics/upload-test-file-generator && brew install --cask upload-test-file-generator
```

Create release tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

For production macOS release (signed + notarized), see:

- [docs/RELEASE_SIGNING.md](./docs/RELEASE_SIGNING.md)

## Open Source

- License: MIT
- Security policy: [SECURITY.md](./SECURITY.md)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)

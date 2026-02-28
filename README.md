# 上传测试文件生成器 (Upload Test File Generator)

[中文说明](./README.zh-CN.md) | [User Guide (EN)](./docs/USER_GUIDE.md) | [用户操作指南](./docs/USER_GUIDE.zh-CN.md)

Desktop app built with Tauri for generating upload test files at configurable size/specs.

## Features

- Generate image/audio/video test files for upload testing.
- Configure resolution, duration, fps, bitrate, count, format.
- Optional file padding to target size in MB.
- One-click presets:
  `10MB image`, `100MB video`, `500MB audio`.
- ffmpeg auto-discovery for Homebrew and common macOS paths.

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
# macOS .app + .dmg
pnpm run build:mac

# Windows installer bundles (for CI/Windows runners)
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

- macOS: `.app`, `.dmg`
- Windows: `.nsis.exe`, `.msi`

Create release tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Open Source

- License: MIT
- Security policy: [SECURITY.md](./SECURITY.md)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)

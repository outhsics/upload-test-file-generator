# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project uses Semantic Versioning.

## [0.1.8] - 2026-02-28

### Fixed

- Stabilized dual-arch macOS release matrix by using `macos-latest` for both `arm64` and `x64` targets.
- Prevented architecture-matrix release cancellation caused by runner label availability differences.

## [0.1.7] - 2026-02-28

### Added

- Homebrew Cask tap support with architecture-aware URLs (`arm64` and `x64`).
- New release DMG aliases for stable download names:
  - `upload-test-file-generator-macos-arm64.dmg`
  - `upload-test-file-generator-macos-x64.dmg`

### Changed

- macOS release workflow now builds both `aarch64-apple-darwin` and `x86_64-apple-darwin`.
- Quickstart guide archive is now architecture-specific (`*-macos-open-guide-arm64.zip` / `*-macos-open-guide-x64.zip`).
- Local build scripts now expose explicit `build:mac:arm64` and `build:mac:x64`.

## [0.1.6] - 2026-02-28

### Changed

- Replaced script-first onboarding with GUI-first Gatekeeper flow: try open once, then use `Privacy & Security -> Open Anyway`.
- Release asset renamed to `*-macos-open-guide.zip` and now includes app + guides + terminal fallback text (no executable script).
- Release notes and user guides now emphasize GUI flow before terminal commands.

### Removed

- Removed distributed `macos-quick-fix.command` to avoid secondary Gatekeeper warnings on script files.

## [0.1.5] - 2026-02-28

### Added

- New `macos-quick-fix.command` for one-click unsigned app repair and launch.
- New release asset `*-macos-unsigned-quickstart.zip` with app + repair script + quickstart docs.

### Changed

- Release notes now explicitly warn users not to launch the app directly inside the DMG window.
- Installation guides now prioritize quickstart zip flow before manual commands.
- macOS bundle `hardenedRuntime` set to `false` for unsigned distribution mode.

## [0.1.4] - 2026-02-28

### Fixed

- macOS release workflow now runs in unsigned mode by default (no `APPLE_*` env vars).
- Prevented CI release failures for users who do not have Apple Developer signing secrets.

## [0.1.3] - 2026-02-28

### Added

- First-run macOS Gatekeeper repair guide (inline + modal).
- One-click copy for Gatekeeper fix command.
- Clear unnotarized warning added to release notes and README docs.

### Changed

- Release workflow no longer hard-fails when Apple signing secrets are missing.
- Download-page release body now includes explicit macOS first-launch fix command.

## [0.1.2] - 2026-02-28

### Added

- First-run dependency onboarding flow for ffmpeg.
- Inline install guide with copy command and re-check action.
- Modal setup overlay shown when ffmpeg is missing.
- New backend command to open install guide from app.

### Changed

- Disabled generation and preset buttons until ffmpeg is detected.
- Improved UX logs and dependency state feedback.

## [0.1.1] - 2026-02-28

### Changed

- Release pipeline adjusted to Windows NSIS-only bundling for stable automation.
- Published bilingual release notes and standardized release assets.

## [0.1.0] - 2026-02-28

### Added

- Tauri desktop app for generating image/audio/video upload test files.
- Presets for `10MB image`, `100MB video`, and `500MB audio`.
- ffmpeg auto-discovery for common macOS paths and Homebrew installations.
- App icon system with 3 design variants and scriptable switching.
- Bilingual docs (English + Chinese).
- GitHub Actions workflows for CI and release bundles.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project uses Semantic Versioning.

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

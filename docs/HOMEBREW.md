# Homebrew Install (macOS)

For developer-focused installation. Supports both Apple Silicon (M1/M2/M3/M4) and Intel with auto-arch selection.

## 1. Add tap

```bash
brew tap outhsics/upload-test-file-generator https://github.com/outhsics/upload-test-file-generator
```

## 2. Install cask (recommended)

```bash
brew install --cask upload-test-file-generator
```

First-time quick install (tap + install in one line):

```bash
brew tap outhsics/upload-test-file-generator https://github.com/outhsics/upload-test-file-generator && brew install --cask upload-test-file-generator
```

## 3. Upgrade

```bash
brew update
brew upgrade --cask upload-test-file-generator
```

## 4. Uninstall

```bash
brew uninstall --cask upload-test-file-generator
```

## 5. If Gatekeeper still blocks launch

1. Try launching once from Applications.
2. Go to `System Settings -> Privacy & Security` and click `Open Anyway`.
3. Launch again.

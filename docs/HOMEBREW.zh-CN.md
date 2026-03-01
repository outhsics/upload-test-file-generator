# Homebrew 安装（macOS）

适用于开发者用户，支持 Apple Silicon（M1/M2/M3/M4）和 Intel Mac 自动选包。

## 1. 添加 Tap

```bash
brew tap outhsics/upload-test-file-generator https://github.com/outhsics/upload-test-file-generator
```

## 2. 安装 Cask（推荐）

```bash
brew install --cask upload-test-file-generator
```

首次快速安装（tap + install 一条命令）：

```bash
brew tap outhsics/upload-test-file-generator https://github.com/outhsics/upload-test-file-generator && brew install --cask upload-test-file-generator
```

## 3. 升级

```bash
brew update
brew upgrade --cask upload-test-file-generator
```

## 4. 卸载

```bash
brew uninstall --cask upload-test-file-generator
```

## 5. 若仍被系统拦截

1. 在“应用程序”中先尝试打开一次。
2. 前往“系统设置 -> 隐私与安全性”点击“仍要打开”。
3. 再次启动应用。

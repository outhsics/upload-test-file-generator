# 用户操作指南

## 1. 安装

1. 从 GitHub Releases 下载最新 `.dmg`。
2. 打开 `.dmg`，把「上传测试文件生成器」拖到 Applications。
3. 首次启动时如有系统安全提示，在“系统设置 -> 隐私与安全性”中允许启动。

## 2. 准备 ffmpeg

App 依赖 `ffmpeg` 生成媒体文件：

```bash
brew install ffmpeg
```

安装完成后重启 App，顶部状态会显示 `ffmpeg：已检测到`。

## 3. 生成文件

1. 选择输出目录（默认是 `~/Downloads/upload-test-files`）。
2. 切换到图片/音频/视频页签。
3. 输入规格参数并点击生成。
4. 在日志区查看执行结果。

## 4. 一键预设

- `10MB 图片`
- `100MB 视频`
- `500MB 音频`

点击后会自动填充参数并立即生成。

## 5. 常见问题

### Q1: 提示找不到 ffmpeg

执行：

```bash
brew install ffmpeg
```

若你不是 Homebrew 安装，可设置环境变量 `FFMPEG_PATH` 指向 ffmpeg 可执行文件。

### Q2: 文件大小不精确

“补齐到 MB”是追加零字节以满足体积测试，适合上传体积场景；若服务端做严格媒体校验，建议优先通过码率/分辨率/时长控制体积。

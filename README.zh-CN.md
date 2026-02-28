# 上传测试文件生成器

[English README](./README.md) | [用户操作指南](./docs/USER_GUIDE.zh-CN.md) | [User Guide (EN)](./docs/USER_GUIDE.md)

这是一个基于 Tauri 的桌面应用，用于开发阶段快速生成上传测试文件。

## 功能

- 生成图片、音频、视频测试文件。
- 自定义分辨率、时长、采样率、码率、数量、格式。
- 支持按目标大小（MB）补齐文件体积。
- 一键预设：
  `10MB 图片`、`100MB 视频`、`500MB 音频`。
- 自动检测 ffmpeg（含 Homebrew 常见路径）。

## 技术栈

- Tauri v2（Rust 后端 + Web 前端）
- 前端使用 HTML/CSS/JS（可直接按前端方式改 UI）
- ffmpeg 负责媒体文件生成

## 本地运行（macOS）

```bash
pnpm install
pnpm run dev
```

## 打包

```bash
# 打 macOS 的 .app + .dmg
pnpm run build:mac

# 打 Windows 安装包（建议在 Windows Runner 上执行）
pnpm run build:windows
```

## 图标风格

```bash
pnpm run icons:generate
python3 scripts/apply_icon.py tech
pnpm tauri icon src-tauri/icons/app-icon.png -o src-tauri/icons
```

可选风格：

- `minimal`
- `tech`（默认）
- `skeuomorphic`

## 自动发布

配置了基于 Tag 的 GitHub Release 工作流，会自动构建并上传安装包：

- macOS：`.app`、`.dmg`
- Windows：`.nsis.exe`

发布示例：

```bash
git tag v0.1.0
git push origin v0.1.0
```

## 开源规范

- 许可证：MIT
- 安全策略：[SECURITY.md](./SECURITY.md)
- 贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)

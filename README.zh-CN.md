# 上传测试文件生成器

[English README](./README.md) | [用户操作指南](./docs/USER_GUIDE.zh-CN.md) | [User Guide (EN)](./docs/USER_GUIDE.md) | [签名与公证](./docs/RELEASE_SIGNING.zh-CN.md)

这是一个基于 Tauri 的桌面应用，用于开发阶段快速生成上传测试文件。

> ⚠️ 当前公开安装包默认是未公证版本。请不要在 DMG 窗口内直接双击 App；先拖到 Applications 再打开。若被拦截，优先按系统“隐私与安全性 -> 仍要打开”处理；若仍失败再执行终端命令，详见 [用户操作指南第 2 节](./docs/USER_GUIDE.zh-CN.md)。

## 功能

- 生成图片、音频、视频测试文件。
- 自定义分辨率、时长、采样率、码率、数量、格式。
- 支持按目标大小（MB）补齐文件体积。
- 一键预设：
  `10MB 图片`、`100MB 视频`、`500MB 音频`。
- 自动检测 ffmpeg（含 Homebrew 常见路径）。
- 内置安装引导：缺少 ffmpeg 时自动弹出引导、支持复制命令与重新检测。

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
- macOS 额外：`*-macos-open-guide.zip`（含图形化引导和终端兜底命令）
- Windows：`.nsis.exe`

发布示例：

```bash
git tag v0.1.0
git push origin v0.1.0
```

商业级 macOS 发布（签名 + 公证）见：

- [docs/RELEASE_SIGNING.zh-CN.md](./docs/RELEASE_SIGNING.zh-CN.md)

## 开源规范

- 许可证：MIT
- 安全策略：[SECURITY.md](./SECURITY.md)
- 贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)

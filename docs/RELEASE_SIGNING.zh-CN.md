# macOS 商业发布：签名与公证

本项目的 `Release` 工作流已支持自动签名与 Apple Notarization。

触发方式：

```bash
git tag v0.1.3
git push origin v0.1.3
```

## 1. 前置条件

- Apple Developer Program 账号
- “Developer ID Application” 证书
- App 专用密码（Apple ID 的 app-specific password）

## 2. GitHub Secrets（必填）

在仓库 `Settings -> Secrets and variables -> Actions` 配置：

- `APPLE_CERTIFICATE`
  证书 `.p12` 的 base64 内容
- `APPLE_CERTIFICATE_PASSWORD`
  导出 `.p12` 时设置的密码
- `APPLE_SIGNING_IDENTITY`
  例如：`Developer ID Application: Your Name (TEAMID)`
- `APPLE_ID`
  Apple ID 邮箱
- `APPLE_PASSWORD`
  Apple ID 的 app-specific password（不是登录密码）
- `APPLE_TEAM_ID`
  Apple Team ID（10位）

工作流会在构建 macOS 包前检查这些 secrets，缺少时会直接失败并给出明确提示。

## 3. 导出证书并转 base64（本地）

```bash
# 导出 p12（在钥匙串中手工导出更直观）
# 然后转 base64：
base64 -i developer-id-app.p12 | pbcopy
```

把剪贴板内容粘贴到 `APPLE_CERTIFICATE`。

## 4. 验证发布结果

Release 成功后，下载 `.dmg`，可在本地检查：

```bash
spctl -a -vv /path/to/上传测试文件生成器.app
codesign -dv --verbose=4 /path/to/上传测试文件生成器.app
```

如果通过，用户安装时通常不会再遇到“已损坏”拦截提示。

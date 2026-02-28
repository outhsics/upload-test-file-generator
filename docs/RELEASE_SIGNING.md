# macOS Production Release: Signing and Notarization

This project release workflow supports automatic macOS code signing and Apple notarization.

Trigger:

```bash
git tag v0.1.3
git push origin v0.1.3
```

## 1. Prerequisites

- Apple Developer Program account
- A valid `Developer ID Application` certificate
- Apple ID app-specific password

## 2. Required GitHub Secrets

Configure in `Settings -> Secrets and variables -> Actions`:

- `APPLE_CERTIFICATE`
  Base64 content of your `.p12` certificate
- `APPLE_CERTIFICATE_PASSWORD`
  Password used when exporting `.p12`
- `APPLE_SIGNING_IDENTITY`
  Example: `Developer ID Application: Your Name (TEAMID)`
- `APPLE_ID`
  Apple ID email
- `APPLE_PASSWORD`
  App-specific password (not account login password)
- `APPLE_TEAM_ID`
  10-character Apple Team ID

The macOS release job validates these secrets before build. Missing values fail fast with a clear error.

## 3. Export and Encode Certificate

```bash
# Export p12 from Keychain Access, then:
base64 -i developer-id-app.p12 | pbcopy
```

Paste the copied value into `APPLE_CERTIFICATE`.

## 4. Verify Output

After release, verify signature and gatekeeper status:

```bash
spctl -a -vv /path/to/上传测试文件生成器.app
codesign -dv --verbose=4 /path/to/上传测试文件生成器.app
```

With proper signing/notarization, users should no longer see “app is damaged” warnings.

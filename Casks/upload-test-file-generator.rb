cask "upload-test-file-generator" do
  version :latest
  sha256 :no_check

  on_arm do
    url "https://github.com/outhsics/upload-test-file-generator/releases/latest/download/upload-test-file-generator-macos-arm64.dmg"
  end
  on_intel do
    url "https://github.com/outhsics/upload-test-file-generator/releases/latest/download/upload-test-file-generator-macos-x64.dmg"
  end

  name "上传测试文件生成器"
  desc "Generate upload test files for image/audio/video"
  homepage "https://github.com/outhsics/upload-test-file-generator"

  app "上传测试文件生成器.app"

  caveats <<~EOS
    This app is currently unsigned/unnotarized.
    First launch may be blocked by Gatekeeper:
      1. Open once from Applications
      2. System Settings -> Privacy & Security -> Open Anyway
  EOS
end

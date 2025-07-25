# 自动发布指南

本项目配置了GitHub Action来自动构建和发布各个系统和架构的应用程序包。

## 发布流程

### 1. 准备工作

确保你的代码已经推送到GitHub仓库，并且所有更改都已经合并到主分支。

### 2. 创建发布标签

当你准备发布新版本时，需要创建一个新的Git标签：

```bash
# 更新package.json中的版本号
# 然后创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

### 3. 自动构建

推送标签后，GitHub Action会自动触发以下构建：

- **macOS**: x64 和 arm64 架构的 .dmg 文件
- **Linux**: x64 和 arm64 架构的 .AppImage 文件  
- **Windows**: x64 架构的 .exe 文件

### 4. 自动发布

构建完成后，GitHub Action会自动：

1. 将所有构建产物上传为GitHub Release
2. 生成发布说明
3. 发布到GitHub Releases页面

## 构建的包类型

| 平台 | 架构 | 文件格式 | 构建脚本 |
|------|------|----------|----------|
| macOS | x64 | .dmg | `dist:mac-x64` |
| macOS | arm64 | .dmg | `dist:mac-arm64` |
| Linux | x64 | .AppImage | `dist:linux-x64` |
| Linux | arm64 | .AppImage | `dist:linux-arm64` |
| Windows | x64 | .exe | `dist:win-x64` |

## 本地构建

如果你想在本地构建特定平台的包：

```bash
# macOS x64
pnpm run dist:mac-x64

# macOS arm64
pnpm run dist:mac-arm64

# Linux x64
pnpm run dist:linux-x64

# Linux arm64
pnpm run dist:linux-arm64

# Windows x64
pnpm run dist:win-x64
```

## 注意事项

1. **标签格式**: 必须使用 `v*` 格式的标签（如 `v1.0.0`）
2. **权限**: 确保GitHub Actions有足够的权限创建Release
3. **构建时间**: 完整构建可能需要10-20分钟
4. **存储空间**: 构建产物会保留30天

## 故障排除

如果构建失败，请检查：

1. 所有依赖是否正确安装
2. Node.js版本是否兼容（推荐使用18.x）
3. 构建脚本是否正常工作
4. GitHub Actions日志中的具体错误信息

## 自定义配置

如果需要修改构建配置，可以编辑：

- `.github/workflows/release.yml` - GitHub Action配置
- `package.json` - 构建脚本和electron-builder配置 
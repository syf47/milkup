# Electron 到 Tauri 迁移说明

## 已完成的迁移工作

### 1. 项目结构变更
- ✅ 创建了 `src-tauri/` 目录，包含 Rust 后端代码
- ✅ 删除了 `src/main/` (Electron 主进程代码)
- ✅ 删除了 `src/preload.ts` (Electron 预加载脚本)
- ✅ 删除了 `dist-electron/` 目录

### 2. 依赖更新
- ✅ 移除了 `electron`, `electron-builder`, `electron-updater`, `vite-plugin-electron`, `esbuild`
- ✅ 添加了 `@tauri-apps/cli`, `@tauri-apps/api` 及相关插件

### 3. 配置文件更新
- ✅ 更新了 `package.json` 的 scripts
- ✅ 更新了 `vite.config.mts`，移除 electron 插件配置
- ✅ 创建了 `src-tauri/tauri.conf.json` Tauri 配置文件
- ✅ 创建了 `src-tauri/Cargo.toml` Rust 项目配置

### 4. API 迁移
- ✅ 创建了 `src/tauri-api.ts` 作为 Tauri API 桥接层
- ✅ 在渲染进程入口引入了 Tauri API
- ✅ 保持了与原 Electron API 兼容的接口

## 开发和构建命令

### 开发模式
```bash
# 切换到正确的 Node 版本
nvm use v22.17.1

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 生产构建
```bash
# 构建应用
pnpm build

# 或者直接使用 Tauri CLI
pnpm tauri build
```

## 需要注意的变更

### 1. API 差异
虽然我们创建了兼容层，但以下功能可能需要进一步实现：

- **文件监听** (`watchFiles`): Tauri 中需要使用 Rust 的 `notify` crate 实现
- **导出 PDF/Word**: 需要在 Tauri 中重新实现，可能需要使用不同的方法
- **自动更新**: 需要配置 Tauri 的 updater 插件
- **系统字体获取**: 需要添加系统特定的实现

### 2. 图标要求
Tauri 需要以下格式的图标：
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

当前只复制了 `.icns` 和 `.ico` 文件，可能需要生成 PNG 版本。

### 3. 自定义协议
原 Electron 中的 `milkup://` 协议需要在 Tauri 中重新实现。可以使用 Tauri 的 asset protocol 或自定义协议处理。

### 4. 窗口管理
- Tauri 中窗口管理略有不同
- 主题编辑器窗口需要使用 Tauri 的 WebviewWindow API
- 窗口标题栏样式配置在 `tauri.conf.json` 中

## 已实现的功能

✅ 文件打开/保存对话框
✅ 窗口控制（最小化、最大化、关闭）
✅ 标题设置
✅ 外部链接打开
✅ 基本的对话框
✅ 目录文件扫描
✅ 通过路径读取文件
✅ 文件只读检查
✅ 主题编辑器窗口

## 需要进一步开发的功能

⚠️ 文件监听 (需要使用 Rust notify crate)
⚠️ PDF/Word 导出 (需要重新实现)
⚠️ 剪贴板图片处理
⚠️ 自动更新完整实现
⚠️ 系统字体列表获取 (需要平台特定实现)

## 测试清单

在完成迁移后，请测试以下功能：

- [ ] 应用启动
- [ ] 文件打开
- [ ] 文件保存
- [ ] 文件另存为
- [ ] 窗口控制按钮
- [ ] 标题栏显示
- [ ] Markdown 渲染
- [ ] 代码高亮
- [ ] 图片显示
- [ ] 外部链接点击
- [ ] 主题切换
- [ ] 主题编辑器
- [ ] 多窗口管理
- [ ] 文件拖拽
- [ ] 工作区文件树

## 故障排除

### 如果遇到编译错误

1. **Rust 工具链问题**
   ```bash
   # 安装 Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **依赖问题**
   ```bash
   # 清理并重新安装
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Tauri CLI 问题**
   ```bash
   # 确保 Tauri CLI 已安装
   pnpm add -D @tauri-apps/cli
   ```

### 如果应用无法启动

1. 检查 `src-tauri/tauri.conf.json` 中的配置
2. 确保 Vite 开发服务器端口 (5173) 未被占用
3. 查看终端输出的错误信息

## 性能优势

相比 Electron，Tauri 的优势：

- 🚀 **更小的体积**: 构建产物通常小 5-10 倍
- ⚡ **更快的启动**: 使用系统 WebView，启动更快
- 💾 **更少的内存**: 不打包 Chromium，内存占用更少
- 🔒 **更好的安全性**: 更严格的权限控制

## 参考资源

- [Tauri 官方文档](https://tauri.app)
- [Tauri API 文档](https://tauri.app/v2/api/js/)
- [从 Electron 迁移到 Tauri](https://tauri.app/v2/guide/electron-vs-tauri/)

# Tauri API 迁移完成

## 已完成的迁移

### 1. 创建了新的 Tauri Composables
- `src/composables/useTauriEvents.ts` - 事件监听
- `src/composables/useTauriWindow.ts` - 窗口控制
- `src/composables/useTauriFile.ts` - 文件操作
- `src/composables/useTauriDialog.ts` - 对话框
- `src/composables/useTauriSystem.ts` - 系统功能

### 2. 更新的文件
- ✅ 删除了 `src/tauri-api.ts` (旧的 Electron 兼容层)
- ✅ 更新了 `src/renderer/main.ts` (移除旧 API 导入)
- ✅ 更新了 `src/renderer/global.d.ts` (移除 electronAPI 类型)
- ✅ 更新了所有 hooks 使用新的 Tauri API
- ✅ 更新了所有组件使用新的 Tauri API
- ✅ 添加了 `tauri-plugin-os` 到 Rust 后端

### 3. Rust 后端
- ✅ 添加了 `tauri-plugin-os = "2"` 到 Cargo.toml
- ✅ 在 main.rs 中初始化插件

## 已知问题和待实现功能

### 需要后续实现的功能
1. **文件监听** - `useTab.ts` 中的文件变动监听需要在 Rust 后端实现
2. **剪贴板图片路径** - `customPastePlugin.ts` 中的图片粘贴功能
3. **临时图片写入** - 需要实现临时文件管理
4. **自动更新** - 需要使用 `@tauri-apps/plugin-updater` 实现更新功能

## 测试清单

运行应用后请测试：
- [x] 应用启动
- [ ] 标题栏和窗口控制按钮是否正常显示
- [ ] 打开文件
- [ ] 保存文件
- [ ] Markdown 渲染
- [ ] Tab 切换
- [ ] 主题切换
- [ ] 字体设置
- [ ] 拖拽文件打开

## 启动应用

```bash
pnpm tauri dev
```

如果遇到编译错误，请先安装 Rust 依赖：

```bash
cd src-tauri
cargo build
cd ..
pnpm tauri dev
```

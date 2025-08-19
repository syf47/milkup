import * as fs from 'node:fs'
import * as path from 'node:path'
import { app, BrowserWindow, globalShortcut } from 'electron'
import { close, getIsQuitting, registerIpcHandleHandlers, registerIpcOnHandlers } from './ipcBridge'
import createMenu from './menu'

let win: BrowserWindow
let themeEditorWindow: BrowserWindow | null = null
let pendingOpenFilePath: string | null = null

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden', // ✅ macOS 专属
    icon: path.join(__dirname, '../assets/icons/milkup.ico'),
    webPreferences: {
      sandbox: false,
      preload: path.resolve(__dirname, '../../dist-electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // 允许加载本地文件
    },
  })
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win)
      win.webContents.openDevTools()
  })

  const indexPath = path.join(__dirname, '../../dist', 'index.html')

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    await win.loadFile(indexPath)
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools()
  }
}

// 创建主题编辑器窗口
export async function createThemeEditorWindow() {
  if (themeEditorWindow && !themeEditorWindow.isDestroyed()) {
    console.log('主题编辑器窗口已存在，聚焦窗口')
    themeEditorWindow.focus()
    return themeEditorWindow
  }

  console.log('创建新的主题编辑器窗口')
  themeEditorWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    parent: win,
    modal: false,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '../assets/icons/milkup.ico'),
    webPreferences: {
      sandbox: false,
      preload: path.resolve(__dirname, '../../dist-electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  })

  // 加载主题编辑器页面
  if (process.env.VITE_DEV_SERVER_URL) {
    await themeEditorWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/theme-editor.html`)
  } else {
    const themeEditorPath = path.join(__dirname, '../../dist', 'theme-editor.html')
    await themeEditorWindow.loadFile(themeEditorPath)
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    themeEditorWindow.webContents.openDevTools()
  }

  // 窗口关闭时清理引用
  themeEditorWindow.on('closed', () => {
    themeEditorWindow = null
  })

  return themeEditorWindow
}

function sendLaunchFileIfExists() {
  const fileArg = process.argv.find(arg => arg.endsWith('.md') || arg.endsWith('.markdown'))

  if (fileArg) {
    openFileInRenderer(fileArg)
  }
}

function openFileInRenderer(filePath: string) {
  const absolutePath = path.resolve(filePath)
  if (!win || win.isDestroyed())
    return
  if (fs.existsSync(absolutePath)) {
    const content = fs.readFileSync(absolutePath, 'utf-8')
    win.webContents.send('open-file-at-launch', {
      filePath: absolutePath,
      content,
    })
  } else {
    console.warn('[main] 文件不存在:', absolutePath)
  }
}

// macOS: 捕获通过 Finder 打开的文件（可能发生在 ready 之前）
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  if (app.isReady() && win) {
    // 应用已就绪，直接分发到渲染进程
    if (win.isMinimized())
      win.restore()
    if (!win.isVisible())
      win.show()
    win.focus()
    openFileInRenderer(filePath)
  } else {
    // 尚未 ready，先缓存，待窗口加载完成后再发送
    pendingOpenFilePath = filePath
  }
})

app.whenReady().then(async () => {
  await createWindow()
  createMenu(win)
  registerIpcOnHandlers(win)
  registerIpcHandleHandlers(win)
  // 确保在页面完成加载后再把待打开的文件发送给渲染进程，避免监听尚未注册导致丢失
  win.webContents.once('did-finish-load', () => {
    if (pendingOpenFilePath) {
      openFileInRenderer(pendingOpenFilePath)
      pendingOpenFilePath = null
    } else {
      // 非 macOS 或通过命令行/关联打开的文件（Windows/Linux）
      sendLaunchFileIfExists()
    }
  })
  win.on('close', (event) => {
    if (process.platform === 'darwin' && !getIsQuitting()) {
      event.preventDefault()
      win.webContents.send('close')
    }
  })
})

// 处理应用即将退出事件（包括右键 Dock 图标的退出）
app.on('before-quit', (event) => {
  if (process.platform === 'darwin' && !getIsQuitting()) {
    event.preventDefault()
    close(win)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// macOS 上处理应用激活事件
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else {
    // 如果窗口存在但被隐藏，则显示它
    if (win && !win.isVisible()) {
      win.show()
    }
    // 将窗口置于前台
    if (win) {
      win.focus()
    }
  }
})

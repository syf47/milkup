import * as fs from 'node:fs'
import * as path from 'node:path'
import { app, BrowserWindow, globalShortcut } from 'electron'
import { close, getIsQuitting, registerIpcHandleHandlers, registerIpcOnHandlers } from './ipcBridge'
import createMenu from './menu'

let win: BrowserWindow
let themeEditorWindow: BrowserWindow | null = null

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
    const absolutePath = path.resolve(fileArg)
    // 使用通用的文件打开函数，它会处理窗口加载状态
    openFileFromPath(absolutePath)
  }
}

// macOS 上处理文件关联打开事件 - 需要在app.whenReady之前注册
app.on('open-file', (event, filePath) => {
  event.preventDefault()

  if (filePath.endsWith('.md') || filePath.endsWith('.markdown')) {
    // 如果应用还没准备好，等待准备完成
    if (!app.isReady()) {
      app.whenReady().then(() => {
        openFileFromPath(filePath)
      })
    } else {
      openFileFromPath(filePath)
    }
  }
})

app.whenReady().then(async () => {
  await createWindow()
  createMenu(win)
  sendLaunchFileIfExists()
  registerIpcOnHandlers(win)
  registerIpcHandleHandlers(win)
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

// 从文件路径打开文件的通用函数
function openFileFromPath(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')

      // 确保窗口存在并且已加载完成
      if (win && win.webContents) {
        // 如果窗口被隐藏，显示它
        if (!win.isVisible()) {
          win.show()
        }

        // 将窗口置于前台
        win.focus()

        // 如果窗口还在加载，等待加载完成
        if (win.webContents.isLoading()) {
          win.webContents.once('did-finish-load', () => {
            win.webContents.send('open-file-at-launch', {
              filePath,
              content,
            })
          })
        } else {
          // 窗口已加载完成，直接发送
          win.webContents.send('open-file-at-launch', {
            filePath,
            content,
          })
        }
      }
    } else {
      console.warn('[main] 文件不存在:', filePath)
    }
  } catch (error) {
    console.error('[main] 打开文件时发生错误:', error)
  }
}

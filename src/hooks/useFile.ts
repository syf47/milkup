// useFile.ts
import { nextTick, onUnmounted } from 'vue'
// import { invoke } from '@tauri-apps/api'
// import { event } from '@tauri-apps/api'
import emitter from '@/renderer/events'
import usContent from './useContent'
import useTitle from './useTitle'

const { updateTitle } = useTitle()
const { markdown, filePath, originalContent } = usContent()

async function onOpen() {
  // TODO: 实现Tauri版本的文件打开
  console.log('Open file - Tauri implementation needed')
  // 临时添加一些示例内容
  filePath.value = 'example.md'
  markdown.value = '# Example\n\nThis is an example markdown file.'
  originalContent.value = markdown.value
  updateTitle()
  nextTick(() => {
    emitter.emit('file:Change')
  })
}

async function onSave() {
  // TODO: 实现Tauri版本的文件保存
  console.log('Save file - Tauri implementation needed')
  originalContent.value = markdown.value
  updateTitle()
  return filePath.value
}

async function onSaveAs() {
  // TODO: 实现Tauri版本的文件另存为
  console.log('Save file as - Tauri implementation needed')
  originalContent.value = markdown.value
  updateTitle()
}

// ✅ 注册事件：只执行一次（确保是单例）
let hasRegistered = false
function registerMenuEventsOnce() {
  if (hasRegistered)
    return
  hasRegistered = true

  // TODO: 实现Tauri版本的菜单事件监听
  console.log('Menu events registered - Tauri implementation needed')
}

// ✅ 立即注册（只注册一次）
registerMenuEventsOnce()

export default function useFile() {
  onUnmounted(() => {
    // 清理事件监听器 - Tauri会自动清理
  })
  return {
    onOpen,
    onSave,
    onSaveAs,
  }
}

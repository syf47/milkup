import { computed, ref } from 'vue'
// import { invoke } from '@tauri-apps/api'
import useContent from './useContent'

const { filePath, isModified } = useContent()

const title = ref('milkup')

const fileName = computed(() => {
  const parts = filePath.value.split(/[\\/]/)
  return parts.at(-1) ?? ''
})

async function updateTitle() {
  const name = fileName.value || 'Untitled'
  const prefix = isModified.value ? '*' : ''
  const titleText = `milkup - ${prefix}${name}`

  // TODO: 实现Tauri版本的设置标题
  // try {
  //   await invoke('set_title', { title: titleText })
  // } catch (error) {
  //   console.error('Failed to set title:', error)
  // }

  title.value = titleText
}

export default function useTitle() {
  return {
    title,
    updateTitle,
  }
}

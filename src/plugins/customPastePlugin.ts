import type { Uploader } from '@milkdown/kit/plugin/upload'
import type { Node, Schema } from '@milkdown/kit/prose/model'
import { uploadImage } from '@/api'
// import { invoke } from '@tauri-apps/api'

export const uploader: Uploader = async (files, schema) => {
  const images: File[] = []
  const pasteMethod = localStorage.getItem('pasteMethod') as 'local' | 'base64' | 'remote'
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file) {
      continue
    }

    // You can handle whatever the file type you want, we handle image here.
    if (!file.type.includes('image')) {
      continue
    }

    images.push(file)
  }
  const nodes: Node[] = []
  for (const image of images) {
    if (pasteMethod === 'base64') {
      const base64 = await turnToBase64(image)
      nodes.push(schema.nodes.image.createAndFill({ src: base64, alt: image.name }) as Node)
      continue
    }
    if (pasteMethod === 'remote') {
      try {
        await upload(image, nodes, schema)
      } catch (error) {
        console.error('Image upload failed:', error)
        continue
      }
    }
    if (pasteMethod === 'local') {
      try {
        await local(image, nodes, schema)
      } catch (error) {
        console.error('Local image handling failed:', error)
        continue
      }
    }
  }
  return nodes
}
function turnToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}
async function upload(image: File, nodes: Node[], schema: Schema<any, any>) {
  const src = await uploadImage(image)
  nodes.push(schema.nodes.image.createAndFill({ src, alt: image.name }) as Node)
}
async function local(image: File, nodes: Node[], schema: Schema<any, any>) {
  // TODO: 实现Tauri版本的本地图片处理
  // try {
  //   const filePath = await invoke<Option<String>>('get_clipboard_image_path')
  //   if (filePath.is_some()) {
  //     nodes.push(schema.nodes.image.createAndFill({ src: filePath.unwrap(), alt: image.name }) as Node)
  //   } else {
  //     const arrayBuffer = await image.arrayBuffer()
  //     const buffer = new Uint8Array(arrayBuffer)
  //     const filePath = await invoke<string>('write_temp_image', {
  //       buffer: Array.from(buffer),
  //       tempDir: localStorage.getItem('localImagePath') || '/temp'
  //     })
  //     nodes.push(schema.nodes.image.createAndFill({ src: filePath, alt: image.name }) as Node)
  //   }
  // } catch (error) {
  //   console.error('Failed to handle local image:', error)
  //   // 降级到base64
  //   const base64 = await turnToBase64(image)
  //   nodes.push(schema.nodes.image.createAndFill({ src: base64, alt: image.name }) as Node)
  // }

  // 临时使用base64方式
  const base64 = await turnToBase64(image)
  nodes.push(schema.nodes.image.createAndFill({ src: base64, alt: image.name }) as Node)
}

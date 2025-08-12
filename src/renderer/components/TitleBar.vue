<script setup lang="ts">
import { ref } from 'vue'
// import { invoke } from '@tauri-apps/api'
// import { getCurrent } from '@tauri-apps/api/window'
import useTitle from '../../hooks/useTitle'
import MenuDropDown from './MenuDropDown.vue'

// 获取平台信息
const isWin = ref(false)
// TODO: 实现Tauri版本的平台检测
// invoke<string>('get_platform').then(platform => {
//   isWin.value = platform === 'win32'
// })

const { title } = useTitle()

const isFullScreen = ref(false)

async function minimize() {
  // TODO: 实现Tauri版本的窗口最小化
  console.log('Minimize window - Tauri implementation needed')
}

async function toggleMaximize() {
  // TODO: 实现Tauri版本的窗口最大化
  isFullScreen.value = !isFullScreen.value
  console.log('Toggle maximize - Tauri implementation needed')
}

async function close() {
  // TODO: 实现Tauri版本的窗口关闭
  console.log('Close window - Tauri implementation needed')
}
</script>

<template>
  <div class="TitleBarBox">
    <template v-if="isWin">
      <MenuDropDown />
      <div class="title" @dblclick="toggleMaximize">
        {{ title }}
      </div>
      <div class="window-controls">
        <span class="iconfont icon-min" @click="minimize"></span>
        <span class="iconfont" :class="isFullScreen ? 'icon-normal' : 'icon-max'" @click="toggleMaximize"></span>
        <span class="iconfont icon-close" @click="close"></span>
      </div>
    </template>
    <template v-else>
      <div></div>
      <div class="title" @dblclick="toggleMaximize">
        {{ title }}
      </div>
      <MenuDropDown />
    </template>
  </div>
</template>

<style lang="less" scoped>
.TitleBarBox {
  -webkit-app-region: drag;
  /* ✅ 允许拖动窗口 */
  height: 32px;
  background: var(--background-color-1);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 12px;
  user-select: none;

  .window-controls {
    display: flex;
    -webkit-app-region: no-drag;

    /* ✅ 控制按钮不能拖动 */
    span {
      cursor: pointer;
      font-size: 16px;
      color: var(--text-color-1);
      padding: 8px;

      &:hover {
        background: var(--hover-color);
      }

      &.icon-close:hover {
        background: #ff5f56;
        color: white;
      }
    }
  }
}
</style>

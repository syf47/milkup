<script setup lang="ts">
import { ref } from "vue";
import { useTauriWindow } from "@/composables/useTauriWindow";
import { useTauriEvents } from "@/composables/useTauriEvents";
import TabBar from "@/renderer/components/workspace/TabBar.vue";
import MenuDropDown from "./MenuDropDown.vue";

const {
  isWindows,
  isMac,
  minimize: tauriMinimize,
  maximize: tauriMaximize,
  close: tauriClose,
} = useTauriWindow();
const { on } = useTauriEvents();

const isFullScreen = ref(false);

function minimize() {
  tauriMinimize();
}

function toggleMaximize() {
  isFullScreen.value = !isFullScreen.value;
  tauriMaximize();
}

async function close() {
  tauriClose();
}

// 监听关闭事件
on("close", () => {
  close();
});
</script>

<template>
  <!-- macOS: 使用 overlay 标题栏样式，红绿灯按钮在左侧 -->
  <div v-if="isMac" class="TitleBarBox macos" data-tauri-drag-region>
    <!-- 红绿灯按钮占位区域 -->
    <div class="traffic-light-spacer"></div>
    <TabBar class="tab-bar-area" />
    <div class="menu-area">
      <MenuDropDown />
    </div>
  </div>
  <!-- Windows: 完全自定义标题栏 -->
  <div v-else class="TitleBarBox" data-tauri-drag-region>
    <MenuDropDown />
    <TabBar />
    <div class="window-controls windows">
      <span class="iconfont icon-min" @click="minimize"></span>
      <span
        class="iconfont"
        :class="isFullScreen ? 'icon-normal' : 'icon-max'"
        @click="toggleMaximize"
      ></span>
      <span class="iconfont icon-close" @click="close"></span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.TitleBarBox {
  -webkit-app-region: drag;
  height: 40px;
  background: var(--background-color-2);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;

  // macOS 样式 - 使用 overlay 标题栏，需要为红绿灯按钮留出空间
  &.macos {
    // 启用拖拽区域
    -webkit-app-region: drag;

    .traffic-light-spacer {
      // macOS 红绿灯按钮的占位空间
      width: 78px;
      height: 100%;
      flex-shrink: 0;
      -webkit-app-region: no-drag;
    }
  }

  .tab-bar-area {
    flex: 1;
    position: relative;
    z-index: 1;
    padding-left: 0;
  }

  .menu-area {
    margin-right: 10px;
    position: relative;
    z-index: 10;
    -webkit-app-region: no-drag;
  }

  .window-controls {
    display: flex;
    -webkit-app-region: no-drag;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;

    &.windows {
      height: 100%;

      span {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        color: var(--text-color-1);
        height: 40px;
        width: 40px;

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
}
</style>

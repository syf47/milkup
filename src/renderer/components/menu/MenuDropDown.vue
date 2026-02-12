<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import logo from "@/assets/icons/milkup.ico";
import emitter from "@/renderer/events";
import MenuBar from "./MenuBar.vue";

const isOpen = ref(false);

// 事件处理器
function handleFileChange() {
  isOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }
}

onMounted(() => {
  emitter.on("file:Change", handleFileChange);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  emitter.off("file:Change", handleFileChange);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="MenuDropDownBox">
    <div class="dropdown-header">
      <img :src="logo" alt="" class="logo" :class="{ active: isOpen }" @click="isOpen = !isOpen" />
    </div>
    <Transition name="menu-fade">
      <div v-show="isOpen" class="dropdown-content">
        <MenuBar />
      </div>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
.MenuDropDownBox {
  height: 100%;
  position: relative;

  .dropdown-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    padding: 0 10px;
    height: 100%;
    -webkit-app-region: no-drag; /* 禁止拖动 */

    img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: inline-block;
      transition: transform 0.2s;

      &:hover {
        opacity: 0.8;
      }

      &.active {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-content {
    position: fixed;
    top: 40px; /* 与标题栏高度一致 */
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--background-color-1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    border-radius: 0 0 10px 10px;
    -webkit-app-region: no-drag; /* 禁止拖动 */
    overflow: hidden;
  }
}

// 自定义菜单过渡效果，不影响尺寸
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>

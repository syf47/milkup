<script setup lang="ts">
import useOutline from '@/hooks/useOutline';

const { outline } = useOutline();

function onOiClick(oi: { id: string; text: string; level: number }) {
  // 滚动到指定元素
  const element = document.querySelector(`h${oi.level}[id="${oi.id}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
</script>

<template>
  <div class="OutlineBox">
    <div class="outlineList">
      <span class="outlineItem" v-for="oi in outline" :style="{ paddingLeft: `${oi.level * 12}px` }" :key="oi.id"
        @click="onOiClick(oi)">
        {{ oi.text }}
      </span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.OutlineBox {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: var(--background-color-2);
  overflow-y: scroll;
  overflow-x: hidden;

  .outlineList {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;

    .outlineItem {
      width: 100%;
      color: var(--text-color-1);
      font-size: 14px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.3s ease;

      &:hover {
        color: var(--text-color-2);
      }
    }
  }
}
</style>

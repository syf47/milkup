// Tauri 事件监听 composable
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { onUnmounted } from "vue";

export function useTauriEvents() {
  const listeners: UnlistenFn[] = [];

  // 监听事件并自动清理
  async function on<T = any>(event: string, handler: (payload: T) => void) {
    const unlisten = await listen<T>(event, (evt) => {
      handler(evt.payload);
    });
    listeners.push(unlisten);
    return unlisten;
  }

  // 组件卸载时自动清理所有监听器
  onUnmounted(() => {
    listeners.forEach((unlisten) => unlisten());
  });

  return {
    on,
  };
}

// Tauri 窗口控制 composable
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function useTauriWindow() {
  const currentWindow = getCurrentWindow();

  async function minimize() {
    try {
      await invoke("window_control", { action: "minimize" });
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  }

  async function maximize() {
    try {
      await invoke("window_control", { action: "maximize" });
    } catch (error) {
      console.error("Failed to maximize window:", error);
    }
  }

  // 请求关闭窗口（会触发关闭确认事件）
  async function close() {
    try {
      await invoke("window_control", { action: "close" });
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  }

  // 强制关闭窗口（绕过关闭确认，用于用户确认后）
  async function forceClose() {
    try {
      await currentWindow.destroy();
    } catch (error) {
      console.error("Failed to force close window:", error);
    }
  }

  async function setTitle(filePath: string | null) {
    try {
      await invoke("set_title", { filePath });
    } catch (error) {
      console.error("Failed to set title:", error);
    }
  }

  async function changeSaveStatus(isSaved: boolean) {
    try {
      await invoke("change_save_status", { isSaved });
    } catch (error) {
      console.error("Failed to change save status:", error);
    }
  }

  // 获取平台信息
  function getPlatform(): string {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("mac")) return "darwin";
      if (ua.includes("win")) return "win32";
      if (ua.includes("linux")) return "linux";
    }
    return "unknown";
  }

  const platform = getPlatform();
  const isMac = platform === "darwin";
  const isWindows = platform === "win32";
  const isLinux = platform === "linux";

  return {
    currentWindow,
    minimize,
    maximize,
    close,
    forceClose,
    setTitle,
    changeSaveStatus,
    platform,
    isMac,
    isWindows,
    isLinux,
  };
}

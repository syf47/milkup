// Tauri 系统功能 composable
import { invoke } from "@tauri-apps/api/core";
import { open as openShell } from "@tauri-apps/plugin-shell";

export function useTauriSystem() {
  async function getSystemFonts(): Promise<string[]> {
    try {
      return await invoke<string[]>("get_system_fonts");
    } catch (error) {
      console.error("Failed to get system fonts:", error);
      return [];
    }
  }

  async function getDirectoryFiles(dirPath: string): Promise<any[]> {
    try {
      return await invoke<any[]>("get_directory_files", { dirPath });
    } catch (error) {
      console.error("Failed to get directory files:", error);
      return [];
    }
  }

  async function openExternal(url: string): Promise<void> {
    try {
      await openShell(url);
    } catch (error) {
      console.error("Failed to open external URL:", error);
    }
  }

  async function openThemeEditor(): Promise<void> {
    try {
      await invoke("open_theme_editor");
    } catch (error) {
      console.error("Failed to open theme editor:", error);
    }
  }

  async function rendererReady(): Promise<void> {
    try {
      await invoke("renderer_ready");
    } catch (error) {
      console.error("Failed to notify renderer ready:", error);
    }
  }

  return {
    getSystemFonts,
    getDirectoryFiles,
    openExternal,
    openThemeEditor,
    rendererReady,
  };
}

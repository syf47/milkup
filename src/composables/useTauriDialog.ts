// Tauri 对话框 composable
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export function useTauriDialog() {
  async function showOverwriteConfirm(fileName: string): Promise<number> {
    try {
      return await invoke<number>("show_overwrite_confirm", { fileName });
    } catch (error) {
      console.error("Failed to show overwrite confirm:", error);
      return 0;
    }
  }

  async function showCloseConfirm(fileName: string): Promise<number> {
    try {
      return await invoke<number>("show_close_confirm", { fileName });
    } catch (error) {
      console.error("Failed to show close confirm:", error);
      return 2;
    }
  }

  async function showOpenDialog(options: { directory?: boolean; multiple?: boolean } = {}) {
    try {
      const selected = await open({
        multiple: options.multiple || false,
        directory: options.directory || false,
      });
      return {
        canceled: !selected,
        filePaths: selected ? (Array.isArray(selected) ? selected : [selected]) : [],
      };
    } catch (error) {
      console.error("Failed to show open dialog:", error);
      return { canceled: true, filePaths: [] };
    }
  }

  return {
    showOverwriteConfirm,
    showCloseConfirm,
    showOpenDialog,
  };
}

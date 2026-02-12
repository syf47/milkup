// Tauri 文件操作 composable
import { invoke } from "@tauri-apps/api/core";

export interface FileData {
  file_path: string;
  content: string;
}

export interface SaveFileRequest {
  file_path: string | null;
  content: string;
}

export function useTauriFile() {
  async function openFile(): Promise<FileData | null> {
    try {
      return await invoke<FileData | null>("open_file");
    } catch (error) {
      console.error("Failed to open file:", error);
      return null;
    }
  }

  async function saveFile(filePath: string | null, content: string): Promise<string | null> {
    try {
      return await invoke<string | null>("save_file", {
        request: { file_path: filePath, content },
      });
    } catch (error) {
      console.error("Failed to save file:", error);
      return null;
    }
  }

  async function saveFileAs(content: string): Promise<FileData | null> {
    try {
      return await invoke<FileData | null>("save_file_as", { content });
    } catch (error) {
      console.error("Failed to save file as:", error);
      return null;
    }
  }

  async function readFileByPath(filePath: string): Promise<FileData | null> {
    try {
      return await invoke<FileData | null>("read_file_by_path", { filePath });
    } catch (error) {
      console.error("Failed to read file by path:", error);
      return null;
    }
  }

  async function isFileReadonly(filePath: string): Promise<boolean> {
    try {
      return await invoke<boolean>("is_file_readonly", { filePath });
    } catch (error) {
      console.error("Failed to check if file is readonly:", error);
      return false;
    }
  }

  return {
    openFile,
    saveFile,
    saveFileAs,
    readFileByPath,
    isFileReadonly,
  };
}

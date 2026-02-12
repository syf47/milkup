// Tauri API 全局类型定义
interface Window {
  __TAURI__?: any;
}

// 导出选项类型
interface ExportPDFOptions {
  pageSize?: string;
  scale?: number;
}

// Block 类型
interface Block {
  type: string;
  text?: string;
  level?: number;
  items?: string[];
  lines?: string[];
  ordered?: boolean;
}

// Tauri 环境变量
declare const __TAURI__: any;

// mod menu;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // .menu(menu::create_menu())
    // .on_menu_event(|event| {
    //   match event.menu_item_id() {
    //     "open" => {
    //       let window = event.window();
    //       let _ = window.emit("menu-open", ());
    //     }
    //     "save" => {
    //       let window = event.window();
    //       let _ = window.emit("menu-save", ());
    //     }
    //     "save_as" => {
    //       let window = event.window();
    //       let _ = window.emit("menu-save-as", ());
    //     }
    //     "toggle_source" => {
    //       let window = event.window();
    //       let _ = window.emit("view:toggleView", ());
    //     }
    //     "toggle_outline" => {
    //       let window = event.window();
    //       let _ = window.emit("view:toggleOutline", ());
    //     }
    //     "about" => {
    //       let window = event.window();
    //       let _ = window.emit("menu-about", ());
    //     }
    //     _ => {}
    //   }
    // })
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      open_file,
      save_file,
      save_file_as,
      get_platform,
      set_title,
      write_temp_image,
      get_clipboard_image_path
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

use tauri::Manager;
use std::fs;
use std::path::PathBuf;
use serde::Serialize;

#[derive(Serialize)]
struct FileResult {
  file_path: String,
  content: String,
}

#[derive(Serialize)]
struct SaveResult {
  file_path: String,
}

#[tauri::command]
async fn open_file() -> Result<FileResult, String> {
  // 暂时使用简单的文件选择器
  // 在Tauri v2中，dialog API可能有所变化
  // 这里先返回一个示例结果
  Ok(FileResult {
    file_path: "example.md".to_string(),
    content: "# Example\n\nThis is an example markdown file.".to_string(),
  })
}

#[tauri::command]
async fn save_file(file_path: Option<String>, content: String) -> Result<SaveResult, String> {
  // 暂时返回示例结果
  Ok(SaveResult {
    file_path: file_path.unwrap_or_else(|| "saved.md".to_string()),
  })
}

#[tauri::command]
async fn save_file_as(content: String) -> Result<FileResult, String> {
  // 暂时返回示例结果
  Ok(FileResult {
    file_path: "saved_as.md".to_string(),
    content,
  })
}

#[tauri::command]
fn get_platform() -> String {
  #[cfg(target_os = "macos")]
  return "darwin".to_string();
  #[cfg(target_os = "windows")]
  return "win32".to_string();
  #[cfg(target_os = "linux")]
  return "linux".to_string();
}

#[tauri::command]
async fn set_title(window: tauri::Window, title: String) {
  let _ = window.set_title(&title);
}

#[tauri::command]
async fn macos_close(window: tauri::Window, title: String) {
  
}

#[tauri::command]
async fn write_temp_image(buffer: Vec<u8>, temp_dir: String) -> Result<String, String> {
  use std::time::{SystemTime, UNIX_EPOCH};
  
  let timestamp = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_millis();
  
  let temp_path = PathBuf::from(&temp_dir);
  if !temp_path.exists() {
    fs::create_dir_all(&temp_path)
      .map_err(|e| format!("Failed to create temp directory: {}", e))?;
  }
  
  let file_name = format!("image_{}.png", timestamp);
  let file_path = temp_path.join(&file_name);
  
  fs::write(&file_path, buffer)
    .map_err(|e| format!("Failed to write temp image: {}", e))?;
  
  Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn get_clipboard_image_path() -> Result<Option<String>, String> {
  // 这里可以实现剪贴板图片路径获取
  // 暂时返回None，后续可以实现
  Ok(None)
}

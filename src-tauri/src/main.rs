// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use std::sync::Mutex;
use tauri::{Emitter, Manager, State, Window, WindowEvent};
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder, PredefinedMenuItem};
use serde::{Deserialize, Serialize};

// 状态管理
struct AppState {
    is_saved: Mutex<bool>,
    is_quitting: Mutex<bool>,
    theme_editor_window: Mutex<Option<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FileData {
    file_path: String,
    content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SaveFileRequest {
    file_path: Option<String>,
    content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct WorkSpaceItem {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<WorkSpaceItem>>,
}

// 打开文件对话框
#[tauri::command]
async fn open_file(window: Window) -> Result<Option<FileData>, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let file_path = window.dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .blocking_pick_file();
    
    match file_path {
        Some(path) => {
            let path_str = path.as_path().unwrap().to_string_lossy().to_string();
            match fs::read_to_string(&path_str) {
                Ok(content) => Ok(Some(FileData {
                    file_path: path_str,
                    content,
                })),
                Err(e) => Err(format!("Failed to read file: {}", e)),
            }
        }
        None => Ok(None),
    }
}

// 保存文件
#[tauri::command]
async fn save_file(window: Window, request: SaveFileRequest) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let file_path = if let Some(path) = request.file_path {
        path
    } else {
        // 显示保存对话框
        match window.dialog()
            .file()
            .add_filter("Markdown", &["md", "markdown"])
            .blocking_save_file() {
            Some(path) => path.as_path().unwrap().to_string_lossy().to_string(),
            None => return Ok(None),
        }
    };
    
    match fs::write(&file_path, request.content) {
        Ok(_) => Ok(Some(file_path)),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

// 另存为
#[tauri::command]
async fn save_file_as(window: Window, content: String) -> Result<Option<FileData>, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let file_path = window.dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .blocking_save_file();
    
    match file_path {
        Some(path) => {
            let path_str = path.as_path().unwrap().to_string_lossy().to_string();
            match fs::write(&path_str, &content) {
                Ok(_) => Ok(Some(FileData {
                    file_path: path_str,
                    content,
                })),
                Err(e) => Err(format!("Failed to write file: {}", e)),
            }
        }
        None => Ok(None),
    }
}

// 通过路径读取文件
#[tauri::command]
async fn read_file_by_path(file_path: String) -> Result<Option<FileData>, String> {
    if !file_path.ends_with(".md") && !file_path.ends_with(".markdown") {
        return Ok(None);
    }
    
    match fs::read_to_string(&file_path) {
        Ok(content) => Ok(Some(FileData {
            file_path,
            content,
        })),
        Err(_) => Ok(None),
    }
}

// 检查文件是否只读
#[tauri::command]
async fn is_file_readonly(file_path: String) -> Result<bool, String> {
    match fs::metadata(&file_path) {
        Ok(metadata) => Ok(metadata.permissions().readonly()),
        Err(e) => Err(format!("Failed to get file metadata: {}", e)),
    }
}

// 窗口控制
#[tauri::command]
async fn window_control(window: Window, action: String) -> Result<(), String> {
    match action.as_str() {
        "minimize" => {
            window.minimize().map_err(|e| e.to_string())?;
        }
        "maximize" => {
            if window.is_maximized().unwrap_or(false) {
                window.unmaximize().map_err(|e| e.to_string())?;
            } else {
                window.maximize().map_err(|e| e.to_string())?;
            }
        }
        "close" => {
            window.close().map_err(|e| e.to_string())?;
        }
        _ => return Err("Invalid action".to_string()),
    }
    Ok(())
}

// 设置标题
#[tauri::command]
async fn set_title(window: Window, file_path: Option<String>) -> Result<(), String> {
    let title = if let Some(path) = file_path {
        let file_name = Path::new(&path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Untitled");
        format!("milkup - {}", file_name)
    } else {
        "milkup - Untitled".to_string()
    };
    
    window.set_title(&title).map_err(|e| e.to_string())
}

// 更改保存状态
#[tauri::command]
async fn change_save_status(state: State<'_, AppState>, is_saved: bool) -> Result<(), String> {
    *state.is_saved.lock().unwrap() = is_saved;
    Ok(())
}

// 打开外部链接
#[tauri::command]
async fn open_external(_url: String) -> Result<(), String> {
    // 使用 shell 插件打开 URL 的功能需要在前端调用
    // 这里保留命令用于兼容性
    Ok(())
}

// 显示覆盖确认对话框
#[tauri::command]
async fn show_overwrite_confirm(_window: Window, _file_name: String) -> Result<i32, String> {
    // Tauri 2.0 的对话框 API 稍有不同，这里返回模拟的结果
    // 实际实现需要根据具体的对话框响应
    Ok(0)
}

// 显示关闭确认对话框
#[tauri::command]
async fn show_close_confirm(_window: Window, _file_name: String) -> Result<i32, String> {
    // 返回模拟结果
    Ok(2)
}

// 获取系统字体列表
#[tauri::command]
async fn get_system_fonts() -> Result<Vec<String>, String> {
    // 这里需要使用系统特定的方法获取字体列表
    // 可以使用 font-kit 或其他字体相关的 crate
    Ok(vec![
        "Arial".to_string(),
        "Times New Roman".to_string(),
        "Courier New".to_string(),
    ])
}

// 获取目录文件
#[tauri::command]
async fn get_directory_files(dir_path: String) -> Result<Vec<WorkSpaceItem>, String> {
    fn scan_directory(path: &Path, depth: usize, max_depth: usize) -> Vec<WorkSpaceItem> {
        if depth > max_depth {
            return vec![];
        }
        
        let mut items = vec![];
        
        if let Ok(entries) = fs::read_dir(path) {
            let mut dirs = vec![];
            let mut files = vec![];
            
            for entry in entries.flatten() {
                let path = entry.path();
                let name = entry.file_name().to_string_lossy().to_string();
                
                // 跳过隐藏文件和特定目录
                if name.starts_with('.') || name == "node_modules" {
                    continue;
                }
                
                if path.is_dir() {
                    let children = scan_directory(&path, depth + 1, max_depth);
                    if !children.is_empty() {
                        dirs.push(WorkSpaceItem {
                            name,
                            path: path.to_string_lossy().to_string(),
                            is_directory: true,
                            children: Some(children),
                        });
                    }
                } else if path.extension().and_then(|s| s.to_str()) == Some("md") 
                    || path.extension().and_then(|s| s.to_str()) == Some("markdown") {
                    files.push(WorkSpaceItem {
                        name,
                        path: path.to_string_lossy().to_string(),
                        is_directory: false,
                        children: None,
                    });
                }
            }
            
            dirs.sort_by(|a, b| a.name.cmp(&b.name));
            files.sort_by(|a, b| a.name.cmp(&b.name));
            
            items.extend(dirs);
            items.extend(files);
        }
        
        items
    }
    
    let path = Path::new(&dir_path);
    if !path.exists() {
        return Ok(vec![]);
    }
    
    Ok(scan_directory(path, 0, 10))
}

// 打开主题编辑器
#[tauri::command]
async fn open_theme_editor(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let mut theme_window = state.theme_editor_window.lock().unwrap();
    
    if let Some(label) = theme_window.as_ref() {
        if let Some(window) = app.get_webview_window(label) {
            let _ = window.set_focus();
            return Ok(());
        }
    }
    
    let _window = tauri::WebviewWindowBuilder::new(
        &app,
        "theme-editor",
        tauri::WebviewUrl::App("/theme-editor.html".into())
    )
    .title("主题编辑器")
    .inner_size(1000.0, 700.0)
    .min_inner_size(800.0, 600.0)
    .decorations(false)
    .build()
    .map_err(|e| e.to_string())?;
    
    *theme_window = Some("theme-editor".to_string());
    
    Ok(())
}

// 渲染进程就绪
#[tauri::command]
async fn renderer_ready() -> Result<(), String> {
    println!("Renderer ready");
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // 暂时注释掉 window-state 插件，它会保存之前的窗口配置导致 decorations 设置无效
        // .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_os::init())
        .manage(AppState {
            is_saved: Mutex::new(true),
            is_quitting: Mutex::new(false),
            theme_editor_window: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            open_file,
            save_file,
            save_file_as,
            read_file_by_path,
            is_file_readonly,
            window_control,
            set_title,
            change_save_status,
            open_external,
            show_overwrite_confirm,
            show_close_confirm,
            get_system_fonts,
            get_directory_files,
            open_theme_editor,
            renderer_ready,
        ])
        .setup(|app| {
            // 在 macOS 上创建原生菜单，以支持 Cmd+C/V 等快捷键
            #[cfg(target_os = "macos")]
            {
                use tauri::menu::Submenu;
                
                // 创建保存菜单项
                let save_item = MenuItemBuilder::new("保存")
                    .id("save")
                    .accelerator("CmdOrCtrl+S")
                    .build(app)?;
                    
                // 创建打开菜单项
                let open_item = MenuItemBuilder::new("打开...")
                    .id("open")
                    .accelerator("CmdOrCtrl+O")
                    .build(app)?;
                    
                // 创建新建菜单项
                let new_item = MenuItemBuilder::new("新建")
                    .id("new")
                    .accelerator("CmdOrCtrl+N")
                    .build(app)?;
                
                let app_menu = SubmenuBuilder::new(app, "milkup")
                    .item(&PredefinedMenuItem::about(app, Some("关于 milkup"), None)?)
                    .separator()
                    .item(&PredefinedMenuItem::hide(app, Some("隐藏 milkup"))?)
                    .item(&PredefinedMenuItem::hide_others(app, Some("隐藏其他"))?)
                    .item(&PredefinedMenuItem::show_all(app, Some("显示全部"))?)
                    .separator()
                    .item(&PredefinedMenuItem::quit(app, Some("退出 milkup"))?)
                    .build()?;

                let file_menu = SubmenuBuilder::new(app, "文件")
                    .item(&new_item)
                    .item(&open_item)
                    .separator()
                    .item(&save_item)
                    .build()?;

                let edit_menu = SubmenuBuilder::new(app, "编辑")
                    .item(&PredefinedMenuItem::undo(app, Some("撤销"))?)
                    .item(&PredefinedMenuItem::redo(app, Some("重做"))?)
                    .separator()
                    .item(&PredefinedMenuItem::cut(app, Some("剪切"))?)
                    .item(&PredefinedMenuItem::copy(app, Some("复制"))?)
                    .item(&PredefinedMenuItem::paste(app, Some("粘贴"))?)
                    .item(&PredefinedMenuItem::select_all(app, Some("全选"))?)
                    .build()?;

                let window_menu = SubmenuBuilder::new(app, "窗口")
                    .item(&PredefinedMenuItem::minimize(app, Some("最小化"))?)
                    .item(&PredefinedMenuItem::maximize(app, Some("最大化"))?)
                    .separator()
                    .item(&PredefinedMenuItem::close_window(app, Some("关闭窗口"))?)
                    .build()?;

                let menu = MenuBuilder::new(app)
                    .item(&app_menu)
                    .item(&file_menu)
                    .item(&edit_menu)
                    .item(&window_menu)
                    .build()?;

                app.set_menu(menu)?;
            }

            // 处理命令行参数打开文件
            if let Some(args) = std::env::args().nth(1) {
                if args.ends_with(".md") || args.ends_with(".markdown") {
                    if let Some(window) = app.get_webview_window("main") {
                        if let Ok(content) = fs::read_to_string(&args) {
                            let _ = window.emit("open-file-at-launch", FileData {
                                file_path: args,
                                content,
                            });
                        }
                    }
                }
            }
            
            Ok(())
        })
        // 处理菜单事件
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if let Some(window) = app.get_webview_window("main") {
                match id {
                    "save" => {
                        let _ = window.emit("menu-save", ());
                    }
                    "open" => {
                        let _ = window.emit("menu-open", ());
                    }
                    "new" => {
                        let _ = window.emit("menu-new", ());
                    }
                    _ => {}
                }
            }
        })
        // 处理窗口事件
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                println!("[Rust] CloseRequested event received");
                // 阻止默认关闭行为
                api.prevent_close();
                // 发送关闭确认事件到前端
                println!("[Rust] Emitting close:confirm event");
                let _ = window.emit("close:confirm", ());
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

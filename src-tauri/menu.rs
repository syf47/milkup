use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn create_menu() -> Menu {
  let file_menu = Submenu::new(
    "文件",
    Menu::new()
      .add_item(CustomMenuItem::new("open".to_string(), "打开..."))
      .add_item(CustomMenuItem::new("save".to_string(), "保存"))
      .add_item(CustomMenuItem::new("save_as".to_string(), "另存为..."))
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Quit),
  );

  let edit_menu = Submenu::new(
    "编辑",
    Menu::new()
      .add_native_item(MenuItem::Undo)
      .add_native_item(MenuItem::Redo)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Cut)
      .add_native_item(MenuItem::Copy)
      .add_native_item(MenuItem::Paste)
      .add_native_item(MenuItem::SelectAll),
  );

  let view_menu = Submenu::new(
    "视图",
    Menu::new()
      .add_item(CustomMenuItem::new("toggle_source".to_string(), "切换源码模式"))
      .add_item(CustomMenuItem::new("toggle_outline".to_string(), "切换大纲"))
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::ZoomIn)
      .add_native_item(MenuItem::ZoomOut)
      .add_native_item(MenuItem::ZoomReset),
  );

  let help_menu = Submenu::new(
    "帮助",
    Menu::new()
      .add_item(CustomMenuItem::new("about".to_string(), "关于")),
  );

  Menu::new()
    .add_submenu(file_menu)
    .add_submenu(edit_menu)
    .add_submenu(view_menu)
    .add_submenu(help_menu)
}

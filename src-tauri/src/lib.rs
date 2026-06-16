mod commands;
mod services;
use commands::tex_bulk_edit::{get_marker_keys, get_tokens, replace_markers};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            replace_markers,
            get_marker_keys,
            get_tokens
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod commands;
mod services;
use commands::tex_bulk_edit::{get_tex_marker_key, get_tokens, replace_tex_string};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            replace_tex_string,
            get_tex_marker_key,
            get_tokens
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod commands;
mod entities;
mod services;
mod migration;
use commands::questions::{create_question, delete_question, list_questions, update_question};
use commands::tex_bulk_edit::{get_marker_keys, get_tokens, replace_markers};
use sea_orm::DatabaseConnection;
use services::db::init_db;
use tauri::Manager;

pub struct DbState {
    db: DatabaseConnection,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db = tauri::async_runtime::block_on(init_db(app))?;

            app.manage(DbState { db });

            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            replace_markers,
            get_marker_keys,
            get_tokens,
            create_question,
            list_questions,
            update_question,
            delete_question,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use crate::services::tex_bulk_edit;
use std::collections::HashMap;

#[tauri::command]
pub async fn replace_markers(
    tex_string: String,
    replacements: HashMap<String, String>,
) -> Result<String, &'static str> {
    let tokens = tex_bulk_edit::lex_string(tex_string);
    return tex_bulk_edit::replace_string(tokens, replacements).ok_or("Missing ket?");
}

#[tauri::command]
pub async fn get_tokens(tex_string: String) -> Result<Vec<tex_bulk_edit::TokenKind>, &'static str> {
    return Ok(tex_bulk_edit::lex_string(tex_string));
}

#[tauri::command]
pub async fn get_marker_keys(tex_string: String) -> Result<HashMap<String, i32>, &'static str> {
    let tokens = tex_bulk_edit::lex_string(tex_string);
    return Ok(tex_bulk_edit::get_marker_keys(tokens));
}

use std::collections::HashMap;

use crate::services::tex_bulk_edit::{get_marker_keys, lex_string, replace_string};

#[tauri::command]
pub async fn replace_tex_string(
    tex_string: String,
    replacements: HashMap<String, String>,
) -> Result<String, &'static str> {
    let tokens = lex_string(tex_string);
    return replace_string(tokens, replacements).ok_or("Missing ket?");
}

#[tauri::command]
async fn get_tex_marker_key(tex_string: String) -> Result<Vec<String>, &'static str> {
    let tokens = lex_string(tex_string);
    return Ok(get_marker_keys(tokens));
}

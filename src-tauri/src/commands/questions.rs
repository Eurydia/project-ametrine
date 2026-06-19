use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait, QueryOrder};
use serde::Deserialize;

use crate::{entities::question, DbState};

#[derive(Deserialize)]
pub struct CreateQuestionInput {
    content: String,
}

#[derive(Deserialize)]
pub struct UpdateQuestionInput {
    id: i32,
    content: String,
}

#[tauri::command]
pub async fn create_question(
    state: tauri::State<'_, DbState>,
    input: CreateQuestionInput,
) -> Result<question::Model, String> {
    let model = question::ActiveModel {
        content: Set(input.content),
        ..Default::default()
    };

    return model.insert(&state.db).await.map_err(|err| err.to_string());
}

#[tauri::command]
pub async fn list_questions(
    state: tauri::State<'_, DbState>,
) -> Result<Vec<question::Model>, String> {
    question::Entity::find()
        .order_by_asc(question::Column::Id)
        .all(&state.db)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_question(
    state: tauri::State<'_, DbState>,
    id: i32,
) -> Result<Option<question::Model>, String> {
    question::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn update_question(
    state: tauri::State<'_, DbState>,
    input: UpdateQuestionInput,
) -> Result<question::Model, String> {
    let existing = question::Entity::find_by_id(input.id)
        .one(&state.db)
        .await
        .map_err(|err| err.to_string())?
        .ok_or_else(|| "question not found".to_string())?;

    let mut model: question::ActiveModel = existing.into();

    model.content = Set(input.content);

    model.update(&state.db).await.map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn delete_question(state: tauri::State<'_, DbState>, id: i32) -> Result<(), String> {
    let result = question::Entity::delete_by_id(id)
        .exec(&state.db)
        .await
        .map_err(|err| err.to_string())?;

    if result.rows_affected == 0 {
        return Err("question not found".to_string());
    }

    Ok(())
}

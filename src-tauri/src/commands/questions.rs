use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, QueryFilter, QueryOrder,
    TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::{
    entities::{question, tag},
    DbState,
};

#[derive(Deserialize)]
pub struct CreateQuestionInput {
    content: String,
    tags: Vec<String>,
}

#[derive(Deserialize)]
pub struct UpdateQuestionInput {
    id: i32,
    content: String,
    tags: Vec<String>,
}

#[derive(Serialize)]
pub struct ListQuestionOutputEntry {
    id: i32,
    content: String,
    tags: Vec<String>,
}

#[tauri::command]
pub async fn create_question(
    state: tauri::State<'_, DbState>,
    data: CreateQuestionInput,
) -> Result<question::Model, String> {
    let tx = state.db.begin().await.map_err(|err| err.to_string())?;

    let question = question::ActiveModel {
        content: Set(data.content),
        ..Default::default()
    }
    .insert(&tx)
    .await
    .map_err(|err| err.to_string())?;

    if !data.tags.is_empty() {
        tag::Entity::insert_many(data.tags.into_iter().map(|name| tag::ActiveModel {
            question_id: Set(question.id),
            name: Set(name),
            ..Default::default()
        }))
        .exec(&tx)
        .await
        .map_err(|err| err.to_string())?;
    }

    tx.commit().await.map_err(|err| err.to_string())?;

    Ok(question)
}

#[tauri::command]
pub async fn list_questions(
    state: tauri::State<'_, DbState>,
) -> Result<Vec<ListQuestionOutputEntry>, String> {
    let result = question::Entity::load()
        .with(tag::Entity)
        .order_by_asc(question::Column::Id)
        .all(&state.db)
        .await
        .map_err(|err| err.to_string())?;

    Ok(result
        .into_iter()
        .map(|entry| ListQuestionOutputEntry {
            id: entry.id,
            content: entry.content,
            tags: entry.tags.into_iter().map(|tag| tag.name).collect(),
        })
        .collect())
}

#[tauri::command]
pub async fn update_question(
    state: tauri::State<'_, DbState>,
    data: UpdateQuestionInput,
) -> Result<question::Model, String> {
    let UpdateQuestionInput { id, content, tags } = data;

    let tx = state.db.begin().await.map_err(|err| err.to_string())?;

    let existing = question::Entity::find_by_id(id)
        .one(&tx)
        .await
        .map_err(|err| err.to_string())?
        .ok_or_else(|| "question not found".to_string())?;

    let mut model: question::ActiveModel = existing.into();
    model.content = Set(content);

    let updated = model.update(&tx).await.map_err(|err| err.to_string())?;

    tag::Entity::delete_many()
        .filter(tag::Column::QuestionId.eq(id))
        .exec(&tx)
        .await
        .map_err(|err| err.to_string())?;

    if !tags.is_empty() {
        tag::Entity::insert_many(tags.into_iter().map(|name| tag::ActiveModel {
            question_id: Set(id),
            name: Set(name),
            ..Default::default()
        }))
        .exec(&tx)
        .await
        .map_err(|err| err.to_string())?;
    }

    tx.commit().await.map_err(|err| err.to_string())?;

    Ok(updated)
}

#[tauri::command]
pub async fn delete_question(state: tauri::State<'_, DbState>, id: i32) -> Result<i32, String> {
    let result = question::Entity::delete_by_id(id)
        .exec(&state.db)
        .await
        .map_err(|err| err.to_string())?;

    if result.rows_affected == 0 {
        return Err("question not found".to_string());
    }

    Ok(id)
}

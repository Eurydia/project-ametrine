use crate::entities::question;
use sea_orm::{ConnectionTrait, Database, DatabaseBackend, DatabaseConnection, Schema};
use tauri::Manager;

pub async fn init_db(app: &tauri::App) -> Result<DatabaseConnection, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    std::fs::create_dir_all(&app_data_dir).map_err(|err| err.to_string())?;

    let db_path = app_data_dir.join("app.sqlite");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.to_string_lossy());

    let db = Database::connect(&db_url)
        .await
        .map_err(|err| err.to_string())?;

    let schema = Schema::new(DatabaseBackend::Sqlite);

    let questions_table = schema
        .create_table_from_entity(question::Entity)
        .if_not_exists()
        .to_owned();

    db.execute(db.get_database_backend().build(&questions_table))
        .await
        .map_err(|err| err.to_string())?;

    Ok(db)
}

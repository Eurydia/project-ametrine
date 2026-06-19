use std::time::Duration;

use crate::migration::Migrator;
use sea_orm::{DatabaseConnection, SqlxSqliteConnector};
use sea_orm_migration::MigratorTrait;
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous};
use tauri::Manager;

pub async fn init_db(app: &tauri::App) -> Result<DatabaseConnection, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    std::fs::create_dir_all(&app_data_dir).map_err(|err| err.to_string())?;

    let db_path = app_data_dir.join("app.sqlite");

    let sqlite_options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal)
        .busy_timeout(Duration::from_secs(5));

    let sqlite_pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(sqlite_options)
        .await
        .map_err(|err| err.to_string())?;

    let db = SqlxSqliteConnector::from_sqlx_sqlite_pool(sqlite_pool);

    Migrator::up(&db, None)
        .await
        .map_err(|err| err.to_string())?;

    Ok(db)
}

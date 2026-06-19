pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20260619_023854_create_questions;
mod m20260619_023917_create_questions;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20260619_023854_create_questions::Migration),
            Box::new(m20260619_023917_create_questions::Migration),
        ]
    }
}

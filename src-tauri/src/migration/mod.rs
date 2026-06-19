use sea_orm_migration::{async_trait, MigrationTrait, MigratorTrait};

pub mod m20260619_023917_create_questions;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![Box::new(m20260619_023917_create_questions::Migration)]
    }
}

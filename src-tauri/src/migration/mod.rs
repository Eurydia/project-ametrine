use sea_orm_migration::{async_trait, MigrationTrait, MigratorTrait};

pub mod m20260619_023917_create_questions;
mod m20260624_043544_add_question_tag_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![Box::new(m20260619_023917_create_questions::Migration)]
    }
}

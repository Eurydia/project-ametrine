use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Questions {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Tags {
    Table,
    Id,
    Name,
}

#[derive(DeriveIden)]
enum QuestionTags {
    Table,
    QuestionId,
    TagId,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Tags::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Tags::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Tags::Name).text().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .table(Tags::Table)
                    .col(Tags::Name)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(QuestionTags::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(QuestionTags::QuestionId)
                            .integer()
                            .not_null(),
                    )
                    .col(ColumnDef::new(QuestionTags::TagId).integer().not_null())
                    .primary_key(
                        Index::create()
                            .col(QuestionTags::QuestionId)
                            .col(QuestionTags::TagId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(QuestionTags::Table, QuestionTags::QuestionId)
                            .to(Questions::Table, Questions::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(QuestionTags::Table, QuestionTags::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(QuestionTags::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Tags::Table).to_owned())
            .await
    }
}

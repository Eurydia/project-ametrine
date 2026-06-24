use sea_orm::entity::prelude::*;
use serde::Serialize;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "questions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    pub content: String,

    #[sea_orm(has_many)]
    pub tags: HasMany<super::tag::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}

use sea_orm::entity::prelude::*;
use serde::Serialize;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    #[sea_orm(unique)]
    pub name: String,

    #[sea_orm(has_many, via = "question_tag")]
    pub questions: HasMany<super::question::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}

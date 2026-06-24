use sea_orm::entity::prelude::*;
use serde::Serialize;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    pub question_id: i32,

    pub name: String,

    #[sea_orm(belongs_to, from = "question_id", to = "id")]
    pub question: HasOne<super::question::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}

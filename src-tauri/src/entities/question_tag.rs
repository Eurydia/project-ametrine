use sea_orm::entity::prelude::*;
use serde::Serialize;

#[sea_orm::model]
#[derive(DeriveEntityModel, Clone, Debug, PartialEq, Serialize)]
#[sea_orm(table_name = "question_tags")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub question_id: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub tag_id: i32,

    #[sea_orm(belongs_to, from = "question_id", to = "id")]
    pub question: Option<super::question::Entity>,
    #[sea_orm(belongs_to, from = "tag_id", to = "id")]
    pub tag: Option<super::tag::Entity>,
}

impl ActiveModelBehavior for ActiveModel {}

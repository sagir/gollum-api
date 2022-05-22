import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { AnswerTypes } from 'App/Enums/AnswerTypes'

export default class Questions extends BaseSchema {
  protected tableName = 'questions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('text', 255).notNullable()
      table.enum('answer_type', Object.values(AnswerTypes))
      table
        .integer('survey_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('surveys')
        .onDelete('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

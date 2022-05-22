import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Answers extends BaseSchema {
  protected tableName = 'answers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('question_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table
        .integer('option_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('options')
        .onDelete('CASCADE')
      table.text('answer').nullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

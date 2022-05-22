import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Options extends BaseSchema {
  protected tableName = 'options'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('text', 255).notNullable()
      table
        .integer('question_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

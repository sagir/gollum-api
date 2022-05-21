import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Surveys extends BaseSchema {
  protected tableName = 'surveys'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.integer('time_limit').notNullable().comment('Time limit in minutes')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('starts_at').notNullable().defaultTo(this.now())
      table.timestamp('ends_at').nullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

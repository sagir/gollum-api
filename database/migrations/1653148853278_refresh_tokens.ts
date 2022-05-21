import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RefreshTokens extends BaseSchema {
  protected tableName = 'refresh_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('token', 32).notNullable().unique()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

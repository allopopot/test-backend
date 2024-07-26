import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pictures'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE') // delete post when user is deleted
      table.string("name").notNullable().defaultTo(""),
      table.string("description").notNullable().defaultTo(""),
      table.string("filename").notNullable().defaultTo(""),
      table.boolean("is_deleted").notNullable().defaultTo(false),
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
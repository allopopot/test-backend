import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

// import User from '#models/user'
// import { HasOne } from '@adonisjs/lucid/types/relations'

export default class Picture extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  // @hasOne(() => User)
  // declare user: HasOne<typeof User>

  @column()
  declare user_id: number

  @column()
  declare description: string | null

  @column()
  declare filename: string

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
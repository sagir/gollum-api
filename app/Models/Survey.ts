import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Question from './Question'

export default class Survey extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public description?: string

  @column()
  public timeLimit: number // in minutes

  @column()
  public userId: number

  @column.dateTime()
  public publishAt?: DateTime

  @column.dateTime()
  public endsAt?: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Question)
  public questions: HasMany<typeof Question>

  // query scopes
  public static finished = scope((query) => {
    query.where((q) => {
      q.whereNotNull('ends_at').andWhere('ends_at', '<=', DateTime.now().toSQL())
    })
  })

  public static published = scope((query) => {
    query.where((q) =>
      q.whereNotNull('publish_at').andWhere('publish_at', '>=', DateTime.now().toSQL())
    )
  })

  public static active = scope((query) => {
    query.where((q1) => {
      q1.whereNotNull('publish_at')
        .andWhere('publish_at', '>=', DateTime.now().toSQL())
        .andWhere((q2) => {
          q2.whereNull('ends_at').orWhere('ends_at', '>', DateTime.now().toSQL())
        })
    })
  })

  public static unpublished = scope((query) => {
    query.where((q) => {
      q.whereNull('publish_at').orWhere('publish_at', '<', DateTime.now().toSQL())
    })
  })
}

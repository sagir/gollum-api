import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  HasMany,
  hasMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Question from './Question'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'

export default class Survey extends BaseModel {
  public serializeExtras = true

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

  @computed()
  public get status() {
    const now = DateTime.now()

    if (this.endsAt && this.publishAt && this.endsAt > now && this.publishAt < now) {
      return SurveyStatuses.Active
    }

    if (this.endsAt && this.endsAt <= now) {
      return SurveyStatuses.Finished
    }

    if (this.publishAt && this.publishAt >= DateTime.now()) {
      return SurveyStatuses.Published
    }

    return SurveyStatuses.Unpublished
  }

  // query scopes
  public static finished = scope((query) => {
    query.where((q) => {
      q.whereNotNull('ends_at').andWhere('ends_at', '<=', DateTime.now().toSQL())
    })
  })

  public static published = scope((query) => {
    query.where((q) =>
      q.whereNotNull('publish_at').andWhere('publish_at', '<', DateTime.now().toSQL())
    )
  })

  public static active = scope((query) => {
    query.where((q1) => {
      q1.whereNotNull('publish_at')
        .andWhere('publish_at', '<', DateTime.now().toSQL())
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

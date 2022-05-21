import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Question from './Question'
import Option from './Option'

export default class Answer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public questionId: number

  @column()
  public optionId?: number

  @column()
  public answer?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Question)
  public question: BelongsTo<typeof Question>

  @belongsTo(() => Option)
  public option: BelongsTo<typeof Option>
}

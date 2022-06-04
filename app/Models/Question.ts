import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Survey from './Survey'
import { AnswerTypes } from 'App/Enums/AnswerTypes'
import Option from './Option'
import Answer from './Answer'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public text: string

  @column()
  public answerType: AnswerTypes

  @column()
  public surveyId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Survey)
  public survey: BelongsTo<typeof Survey>

  @hasMany(() => Option)
  public options: HasMany<typeof Option>

  @hasMany(() => Answer)
  public answers: HasMany<typeof Answer>
}

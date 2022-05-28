import { AnswerTypes } from 'App/Enums/AnswerTypes'

export interface QuestionDto {
  text: string
  answerType: AnswerTypes
  options: string[]
}

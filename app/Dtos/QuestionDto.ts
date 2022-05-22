import { AnswerTypes } from 'App/Enums/AnswerTypes'
import { OptionDto } from './OptionDto'

export interface QuestionDto {
  text: string
  answerType: AnswerTypes
  options: OptionDto[]
}

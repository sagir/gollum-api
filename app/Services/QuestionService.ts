import Database from '@ioc:Adonis/Lucid/Database'
import { QuestionDto } from 'App/Dtos/QuestionDto'
import { AnswerTypes } from 'App/Enums/AnswerTypes'
import Question from 'App/Models/Question'
import Survey from 'App/Models/Survey'
import HttpException from './../Exceptions/HttpException'

export class QuestionService {
  public static async saveQuestion(
    survey: Survey,
    questionDto: QuestionDto,
    questionModel?: Question
  ): Promise<Question> {
    const trx = await Database.transaction()
    let question: Question

    try {
      if (!questionModel) {
        question = await survey.useTransaction(trx).related('questions').create({
          text: questionDto.text,
          answerType: questionDto.answerType,
        })
      } else {
        question = questionModel
        question.text = questionDto.text
        question.answerType = questionDto.answerType
        await question.useTransaction(trx).save()
      }

      await question.related('options').query().useTransaction(trx).delete().exec()
      if (question.answerType !== AnswerTypes.Text) {
        await question
          .useTransaction(trx)
          .related('options')
          .createMany(questionDto.options.map((text) => ({ text })))
      }

      await trx.commit()
      await question.load('options')
      return question
    } catch (error) {
      console.error(error)
      await trx.rollback()
      throw new HttpException(
        'Something went wrong. Please try again later.',
        500,
        'E_SERVER_ERROR'
      )
    }
  }
}

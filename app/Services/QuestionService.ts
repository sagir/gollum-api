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
    question?: Question
  ): Promise<Question> {
    const trx = await Database.transaction()

    try {
      if (!question) {
        question = await survey.useTransaction(trx).related('questions').create({
          text: questionDto.text,
          answerType: questionDto.answerType,
        })
      } else {
        question.text = questionDto.text
        question.answerType = questionDto.answerType
        await question.useTransaction(trx).save()
      }

      await question.related('options').query().useTransaction(trx).delete().exec()
      if (question.answerType !== AnswerTypes.Text) {
        await question.useTransaction(trx).related('options').createMany(questionDto.options)
      }

      await trx.commit()
      return question
    } catch (error) {
      await trx.rollback()
      throw new HttpException(
        'Something went wrong. Please try again later.',
        500,
        'E_SERVER_ERROR'
      )
    }
  }
}

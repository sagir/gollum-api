import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { QuestionDto } from 'App/Dtos/QuestionDto'
import Question from 'App/Models/Question'
import Survey from 'App/Models/Survey'
import { QuestionService } from 'App/Services/QuestionService'
import { SurveyService } from 'App/Services/SurveyService'
import QuestionValidator from 'App/Validators/QuestionValidator'
import HttpException from './../../Exceptions/HttpException'

export default class QuestionsController {
  public async store({ auth, params, request, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.query()
      .withCount('questions')
      .where('id', params.surveyId)
      .firstOrFail()

    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey, 'Adding question to published survey is not allowed.')

    await request.validate(QuestionValidator)
    const question = await QuestionService.saveQuestion(
      survey,
      request.only(['text', 'answerType', 'options']) as QuestionDto
    )

    response.created(question)
  }

  public async show({ params }: HttpContextContract): Promise<{
    question: Question
    nextQuestionId?: number
    previousQuestionId?: number
  }> {
    const questions = await Question.query().andWhere('survey_id', params.surveyId).exec()
    const index = questions.findIndex(({ id }) => id === Number(params.questionId))

    if (index === -1) {
      throw new HttpException('Question Not found.', 404, 'E_NOT_FOUND')
    }

    return {
      question: questions.at(index) as Question,
      nextQuestionId: questions.at(index + 1)?.id,
      previousQuestionId: index ? questions.at(index - 1)?.id : undefined,
    }
  }

  public async update({ auth, params, request, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.query()
      .withCount('questions')
      .where('id', params.surveyId)
      .firstOrFail()

    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey, 'Adding question to published survey is not allowed.')

    const question = await survey
      .related('questions')
      .query()
      .preload('options')
      .where('id', params.questionId)
      .firstOrFail()

    await request.validate(QuestionValidator)
    await QuestionService.saveQuestion(
      survey,
      request.only(['text', 'answerType', 'options']) as QuestionDto,
      question
    )

    response.noContent()
  }

  public async destroy({ auth, params, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.query()
      .withCount('questions')
      .where('id', params.surveyId)
      .firstOrFail()

    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey, 'Adding question to published survey is not allowed.')

    const question = await survey
      .related('questions')
      .query()
      .where('id', params.questionId)
      .firstOrFail()

    await question.delete()
    return response.noContent()
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { QuestionDto } from 'App/Dtos/QuestionDto'
import Survey from 'App/Models/Survey'
import { QuestionService } from 'App/Services/QuestionService'
import { SurveyService } from 'App/Services/SurveyService'
import QuestionValidator from 'App/Validators/QuestionValidator'

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
      request.only(['text', 'answerType', 'options']) as QuestionDto
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

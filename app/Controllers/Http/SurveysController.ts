import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import Survey from 'App/Models/Survey'
import SurveyListRequestValidator from './../../Validators/SurveyListRequestValidator'
import { SurveyService } from './../../Services/SurveyService'
import SurveyValidator from 'App/Validators/SurveyValidator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import HttpException from 'App/Exceptions/HttpException'

export default class SurveysController {
  public async index({ request }: HttpContextContract): Promise<ModelPaginatorContract<Survey>> {
    await request.validate(SurveyListRequestValidator)
    return SurveyService.getList(
      Number(request.input('page', 1)),
      Number(request.input('perPage', 10)),
      request.input('search', ''),
      request.input('sortBy', SurveySortOptions.Latest),
      request.input('status', SurveyStatuses.All),
      Number(request.input('user'))
    )
  }

  public async store({ auth, request, response }: HttpContextContract): Promise<void> {
    await request.validate(SurveyValidator)

    const survey = await Survey.create({
      title: request.input('title'),
      timeLimit: request.input('timeLimit'),
      description: request.input('description'),
      userId: auth.user?.id,
    })

    response.created(survey)
  }

  public show({ params }: HttpContextContract): Promise<Survey> {
    return Survey.query()
      .preload('user')
      .preload('questions', (query) => query.preload('options'))
      .where('id', params.id)
      .firstOrFail()
  }

  public async update({ auth, params, request, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.findOrFail(params.id)
    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey)
    await request.validate(SurveyValidator)

    survey.title = request.input('title')
    survey.description = request.input('description')
    survey.timeLimit = request.input('timeLimit')

    await survey.save()
    response.noContent()
  }

  public async destroy({ auth, params, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.findOrFail(params.id)
    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey)
    await survey.delete()
    response.noContent()
  }

  public async publish({ auth, params, request, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.query().withCount('questions').where('id', params.id).firstOrFail()
    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey, 'Survey is already published')

    if (!survey.$extras.questionsCount) {
      throw new HttpException(
        'Pleaes add at-least 1 question before publishing it.',
        400,
        'E_BAD_REQUEST'
      )
    }

    await request.validate({
      schema: schema.create({
        endsAt: schema.date({ format: 'iso' }, [rules.required(), rules.after('today')]),
      }),
    })

    const endsAt = request.input('endsAt')
    survey.publishAt = DateTime.now()
    survey.endsAt = endsAt ? DateTime.fromISO(endsAt) : undefined
    await survey.save()
    return response.noContent()
  }
}

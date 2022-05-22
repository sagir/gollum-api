import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import Survey from 'App/Models/Survey'
import SurveyListRequestValidator from './../../Validators/SurveyListRequestValidator'
import { SurveyService } from './../../Services/SurveyService'
import SurveyValidator from 'App/Validators/SurveyValidator'
import HttpException from './../../Exceptions/HttpException'

export default class SurveysController {
  public async index({ request }: HttpContextContract): Promise<ModelPaginatorContract<Survey>> {
    await request.validate(SurveyListRequestValidator)
    return SurveyService.getList(
      Number(request.input('page', 1)),
      Number(request.input('perPage', 10)),
      request.input('search', ''),
      request.input('sortBy', SurveySortOptions.Latest),
      request.input('status', SurveyStatuses.All)
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

    if (survey.userId !== auth.user?.id) {
      throw new HttpException(
        'You are not authorized to update this survey',
        403,
        'E_AUTHORIZATION'
      )
    }

    await request.validate(SurveyValidator)
    survey.title = request.input('title')
    survey.description = request.input('description')
    survey.timeLimit = request.input('timeLimit')
    await survey.save()
    response.noContent()
  }

  public async destroy({}: HttpContextContract) {}
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import Survey from 'App/Models/Survey'
import SurveyListRequestValidator from './../../Validators/SurveyListRequestValidator'
import { SurveyService } from './../../Services/SurveyService'
import CreateSurveyValidator from 'App/Validators/CreateSurveyValidator'

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
    await request.validate(CreateSurveyValidator)

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

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

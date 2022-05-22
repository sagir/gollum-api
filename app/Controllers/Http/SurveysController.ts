import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import Survey from 'App/Models/Survey'
import SurveyListRequestValidator from './../../Validators/SurveyListRequestValidator'
import { SurveyService } from './../../Services/SurveyService';

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

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import Survey from 'App/Models/Survey'
import SurveyListRequestValidator from './../../Validators/SurveyListRequestValidator'
import { SurveyService } from './../../Services/SurveyService'
import SurveyValidator from 'App/Validators/SurveyValidator'
import { DateTime } from 'luxon'
import HttpException from 'App/Exceptions/HttpException'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { AnswerDto } from 'App/Dtos/AnswerDto'
import Answer from 'App/Models/Answer'

export default class SurveysController {
  public async index({ request }: HttpContextContract): Promise<ModelPaginatorContract<Survey>> {
    await request.validate(SurveyListRequestValidator)
    const res = await SurveyService.getList(
      Number(request.input('page', 1)),
      Number(request.input('perPage', 10)),
      request.input('search', ''),
      request.input('sortBy', SurveySortOptions.Latest),
      request.input('status', 0),
      Number(request.input('user', 0)),
      Number(request.input('takenBy', 0)),
      Number(request.input('notTakenBy', 0))
    )
    return res
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

  public async publish({ auth, params, response }: HttpContextContract): Promise<void> {
    const survey = await Survey.query().withCount('questions').where('id', params.id).firstOrFail()
    SurveyService.authorize(survey, auth.user)
    SurveyService.blockIfPublished(survey, 'Survey is already published')

    if (!survey.$extras.questions_count) {
      throw new HttpException(
        'Pleaes add at-least 1 question before publishing it.',
        400,
        'E_BAD_REQUEST'
      )
    }

    // await request.validate({
    //   schema: schema.create({
    //     endsAt: schema.date({ format: 'iso' }, [rules.required(), rules.after('today')]),
    //   }),
    // })

    // const endsAt = request.input('endsAt')
    survey.publishAt = DateTime.now()
    // survey.endsAt = endsAt ? DateTime.fromISO(endsAt) : undefined
    await survey.save()
    return response.noContent()
  }

  public async takeSurvey({ auth, params, request, response }: HttpContextContract): Promise<void> {
    await Survey.findOrFail(params.id)

    await request.validate({
      schema: schema.create({
        answers: schema.array([rules.minLength(1)]).members(
          schema.object([rules.required()]).members({
            id: schema.number([rules.required(), rules.unsigned()]),
            option: schema.array
              .optional([rules.minLength(1)])
              .members(schema.number([rules.unsigned()])),
            answer: schema.string.optional({ trim: true }, [rules.minLength(3)]),
          })
        ),
      }),
    })

    const user = auth.use('api').user as User
    const data = request.input('answers') as AnswerDto[]

    const answers: Array<Partial<Answer>> = []
    const questionIds: number[] = []

    data.forEach(({ id, options, answer }) => {
      questionIds.push(id)

      options
        ?.filter((item, index) => options.indexOf(item) === index)
        .forEach((option) => {
          answers.push({
            questionId: id,
            userId: user.id,
            optionId: option,
          })
        })

      if (answer) {
        answers.push({
          questionId: id,
          userId: user.id,
          answer,
        })
      }
    })

    await Answer.query().whereIn('question_id', questionIds).andWhere('user_id', user.id).delete()
    await Answer.createMany(answers)
    return response.noContent()
  }

  public async report({ params }: HttpContextContract): Promise<Survey> {
    return await Survey.query()
      .preload('questions', (query) => {
        query.preload('answers', (query) => query.preload('user')).preload('options')
      })
      .where('id', params.id)
      .firstOrFail()
  }
}

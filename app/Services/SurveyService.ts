import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import HttpException from 'App/Exceptions/HttpException'
import Survey from 'App/Models/Survey'
import User from 'App/Models/User'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

export class SurveyService {
  public static getList(
    page: number,
    perPage: number,
    search: string,
    sortBy: SurveySortOptions,
    status: SurveyStatuses,
    user?: number,
    takenBy?: number,
    notTakenBy?: number
  ): Promise<ModelPaginatorContract<Survey>> {
    const query = Survey.query()
      .withCount('questions')
      .preload('user')
      .withAggregate('answers', (query) => {
        query.countDistinct('user_id').as('total_taken')
      })

    if (takenBy) {
      query
        .whereHas('answers', (query) => {
          query.where('user_id', takenBy)
        })
        .preload('answers', (query) => {
          query.where('user_id', takenBy).groupBy('question_id').orderBy('created_at', 'desc')
        })
    }

    if (notTakenBy) {
      query.whereDoesntHave('answers', (query) => {
        query.where('user_id', notTakenBy)
      })
    }

    switch (status) {
      case SurveyStatuses.Finished:
        query.withScopes((q) => q.finished())
        break
      case SurveyStatuses.Published:
        query.withScopes((q) => q.published())
        break
      case SurveyStatuses.Active:
        query.withScopes((q) => q.active())
        break
      case SurveyStatuses.Unpublished:
        query.withScopes((q) => q.unpublished())
        break
    }

    if (search) {
      query.where((q) => {
        q.where('title', 'like', `%${search}%`).orWhere('description', 'like', `%${search}%`)
      })
    }

    let sortByColumn: string
    let sortByDirection: 'asc' | 'desc'

    switch (sortBy) {
      case SurveySortOptions.Latest:
        sortByColumn = 'publish_at'
        sortByDirection = 'desc'
        break
      case SurveySortOptions.Oldest:
        sortByColumn = 'publish_at'
        sortByDirection = 'asc'
        break
      case SurveySortOptions.Longest:
        sortByColumn = 'time_limit'
        sortByDirection = 'desc'
        break
      case SurveySortOptions.Shortest:
        sortByColumn = 'time_limit'
        sortByDirection = 'asc'
        break
      case SurveySortOptions.Title:
        sortByColumn = 'title'
        sortByDirection = 'asc'
        break
    }

    if (user) {
      query.where('user_id', user)
    }

    return query.orderBy(sortByColumn, sortByDirection).paginate(page, perPage)
  }

  public static authorize(survey: Survey, user?: User): void {
    if (!user || user.id !== survey.userId) {
      throw new HttpException(
        'You are not authorized to update this survey',
        403,
        'E_AUTHORIZATION'
      )
    }
  }

  public static blockIfPublished(
    survey: Survey,
    message: string = "Published surveys can't be updated/deleted"
  ): void {
    if (survey.publishAt && survey.publishAt.diffNow().milliseconds <= 0) {
      throw new HttpException(message, 400, 'E_BAD_REQUEST')
    }
  }
}

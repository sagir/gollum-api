import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import HttpException from 'App/Exceptions/HttpException'
import Survey from 'App/Models/Survey'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export class SurveyService {
  public static getList(
    page: number,
    perPage: number,
    search: string,
    sortBy: SurveySortOptions,
    status: SurveyStatuses
  ) {
    const query = Survey.query().withCount('questions')
    const nowSql = DateTime.now().toSQL()

    switch (status) {
      case SurveyStatuses.Finished:
        query.whereNotNull('ends_at').andWhere('ends_at', '<=', nowSql)
        break
      case SurveyStatuses.Published:
        query.where('publish_at', '>=', nowSql)
        break
      case SurveyStatuses.Active:
        query.where('publish_at', '>=', nowSql).andWhere((q) => {
          q.whereNull('ends_at').orWhere('ends_at', '>', nowSql)
        })
        break
      case SurveyStatuses.Unpublished:
        query.where((q) => q.whereNull('publish_at').orWhere('publish_at', '<', nowSql))
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

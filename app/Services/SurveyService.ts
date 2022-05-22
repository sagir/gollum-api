import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'
import Survey from 'App/Models/Survey'
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
}

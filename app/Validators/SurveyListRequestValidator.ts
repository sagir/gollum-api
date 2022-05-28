import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SurveySortOptions } from 'App/Enums/SurveySortOptions'
import { SurveyStatuses } from 'App/Enums/SurveyStatuses'

export default class SurveyListRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    page: schema.number.nullableAndOptional([
      rules.unsigned(),
      rules.range(1, Number.MAX_SAFE_INTEGER),
    ]),
    perPage: schema.number.nullableAndOptional([
      rules.unsigned(),
      rules.range(1, Number.MAX_SAFE_INTEGER),
    ]),
    search: schema.string.nullableAndOptional(),
    sortBy: schema.enum.nullableAndOptional(Object.values(SurveySortOptions)),
    status: schema.enum.nullableAndOptional(Object.values(SurveyStatuses)),
    user: schema.number.nullableAndOptional([
      rules.unsigned(),
      rules.range(1, Number.MAX_SAFE_INTEGER),
    ]),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}

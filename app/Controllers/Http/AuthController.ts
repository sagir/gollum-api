import { OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { UserService } from 'App/Services/UserService'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class AuthController {
  public async register({
    auth,
    request,
  }: HttpContextContract): Promise<{ user: User; token: OpaqueTokenContract<User> }> {
    await request.validate(RegisterValidator)

    const user = await UserService.createUser(
      request.input('name'),
      request.input('email'),
      request.input('password')
    )

    const token = await UserService.generateTokens(user, auth)
    return { user, token }
  }
}

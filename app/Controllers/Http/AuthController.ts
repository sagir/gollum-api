import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { LoginResponse } from 'App/Responses/LoginResponse'
import { UserService } from 'App/Services/UserService'
import LoginValidator from 'App/Validators/LoginValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import LoginFailException from 'App/Exceptions/LoginFailException'

export default class AuthController {
  public async register({ auth, request }: HttpContextContract): Promise<LoginResponse> {
    await request.validate(RegisterValidator)

    const user = await UserService.createUser(
      request.input('name'),
      request.input('email'),
      request.input('password')
    )

    const token = await UserService.generateTokens(user, auth)
    return { user, token }
  }

  public async login({ auth, request }: HttpContextContract): Promise<LoginResponse> {
    await request.validate(LoginValidator)

    const user = await User.findBy('email', request.input('email'))

    if (user && (await Hash.verify(user.password, request.input('password')))) {
      const token = await UserService.generateTokens(user, auth)
      return { user, token }
    }

    throw new LoginFailException()
  }
}

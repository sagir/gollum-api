import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { LoginResponse } from 'App/Responses/LoginResponse'
import { UserService } from 'App/Services/UserService'
import LoginValidator from 'App/Validators/LoginValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import RefreshToken from './../../Models/RefreshToken'
import { TokenResponse } from './../../Responses/TokenResponse'
import BadRequestException from './../../Exceptions/BadRequestException'

export default class AuthController {
  public async register({ auth, request }: HttpContextContract): Promise<LoginResponse> {
    await request.validate(RegisterValidator)

    const user = await UserService.createUser(
      request.input('name'),
      request.input('email'),
      request.input('password')
    )

    const { token, refreshToken } = await UserService.generateTokens(user, auth)
    return { user, token, refreshToken }
  }

  public async login({ auth, request }: HttpContextContract): Promise<LoginResponse> {
    await request.validate(LoginValidator)

    const user = await User.findBy('email', request.input('email'))

    if (user && (await Hash.verify(user.password, request.input('password')))) {
      const { token, refreshToken } = await UserService.generateTokens(user, auth)
      return { user, token, refreshToken }
    }

    throw new BadRequestException("Username or password didn't match", 400, 'E_INVALID_CREDENTIALS')
  }

  public async refreshToken({ auth, request }: HttpContextContract): Promise<TokenResponse> {
    await request.validate({
      schema: schema.create({
        token: schema.string({ trim: true }, [rules.required()]),
      }),
    })

    const previousToken = await RefreshToken.query()
      .where('token', request.input('token'))
      .andWhere('expires_at', '>', DateTime.now().toSQL())
      .firstOrFail()

    if (previousToken) {
      const user = await User.findOrFail(previousToken.userId)
      const { token, refreshToken } = await UserService.generateTokens(user, auth)
      await previousToken.delete()
      return { token, refreshToken }
    }

    throw new BadRequestException('Invalid token.', 400, 'E_INVALID_TOKEN')
  }
}

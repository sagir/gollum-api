import { AuthContract, OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import RefreshToken from './../Models/RefreshToken'

export class UserService {
  public static createUser(name: string, email: string, password: string): Promise<User> {
    const user = new User()
    user.name = name
    user.email = email
    user.password = password
    return user.save()
  }

  public static async generateTokens(
    user: User,
    auth: AuthContract
  ): Promise<{ token: OpaqueTokenContract<User>; refreshToken: RefreshToken }> {
    const token = await auth.use('api').generate(user, { expiresIn: '30mins' })
    const refreshToken = await user.related('refreshTokens').create({
      token: cuid(),
      expiresAt: DateTime.now().plus({ hours: 24 }),
    })

    return { token, refreshToken }
  }
}

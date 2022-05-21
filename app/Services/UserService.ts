import { AuthContract, OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import User from 'App/Models/User'

export class UserService {
  public static createUser(name: string, email: string, password: string): Promise<User> {
    const user = new User()
    user.name = name
    user.email = email
    user.password = password
    return user.save()
  }

  public static generateTokens(user: User, auth: AuthContract): Promise<OpaqueTokenContract<User>> {
    return auth.use('api').generate(user, { expiresIn: '30mins' })
  }
}

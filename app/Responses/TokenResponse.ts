import { OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import RefreshToken from 'App/Models/RefreshToken'
import User from 'App/Models/User'

export interface TokenResponse {
  token: OpaqueTokenContract<User>
  refreshToken: RefreshToken
}

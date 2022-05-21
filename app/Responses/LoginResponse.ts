import { OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'
import User from 'App/Models/User'

export interface LoginResponse {
  user: User
  token: OpaqueTokenContract<User>
}

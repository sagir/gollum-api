import User from 'App/Models/User'
import { TokenResponse } from './TokenResponse'

export interface LoginResponse extends TokenResponse {
  user: User
}

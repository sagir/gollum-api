import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new LoginFailException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class LoginFailException extends Exception {
  constructor(
    message: string = "Username or password didn't match",
    status: number = 400,
    errorCode: string = 'E_LOGIN_FAILED'
  ) {
    super(message, status, errorCode)
  }
}

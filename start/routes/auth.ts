import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('register', 'AuthController.register').as('register')
  Route.post('login', 'AuthController.login').as('login')
  Route.post('refresh-token', 'AuthController.refreshToken').as('refreshToken')
}).prefix('api/v1/auth')

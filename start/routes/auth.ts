import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('register', 'AuthController.register').as('register')
}).prefix('api/v1/auth')

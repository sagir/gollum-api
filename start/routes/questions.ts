import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'QuestionsController.index').as('index')
  Route.post('/', 'QuestionsController.store').as('store')
  Route.put('/:id', 'QuestionsController.update').as('update')
  Route.delete('/:id', 'QuestionsController.destroy').as('destroy')
})
  .prefix('api/v1/questions')
  .as('api.v1.questions')

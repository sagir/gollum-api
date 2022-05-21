import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'SurveysController.index').as('index')
  Route.post('/', 'SurveysController.store').as('store')
  Route.get('/:id', 'SurveysController.show').as('show')
  Route.put('/:id', 'SurveysController.update').as('update')
  Route.delete('/:id', 'SurveysController.destroy').as('destroy')
})
  .prefix('api/v1/surveys')
  .as('api.v1.surveys')

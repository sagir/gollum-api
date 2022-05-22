import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'SurveysController.index').as('index')
  Route.post('/', 'SurveysController.store').as('store').middleware('auth')
  Route.get('/:id', 'SurveysController.show').as('show')
  Route.put('/:id', 'SurveysController.update').as('update').middleware('auth')
  Route.delete('/:id', 'SurveysController.destroy').as('destroy').middleware('auth')
  Route.patch('/:id/publish', 'SurveyController.publish').as('publish').middleware('auth')
})
  .prefix('api/v1/surveys')
  .as('api.v1.surveys')

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/surveys/:surveyId/questions/:questionId', 'QuestionsController.show').as('show')
  Route.post('/surveys/:surveyId/questions', 'QuestionsController.store').as('store')
  Route.put('/surveys/:surveyId/questions/:questionId', 'QuestionsController.update').as('update')
  Route.delete('/surveys/:surveyId/questions/:questionId', 'QuestionsController.destroy').as(
    'destroy'
  )
})
  .prefix('api/v1')
  .as('api.v1.questions')
  .middleware('auth')

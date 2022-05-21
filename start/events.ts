import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'
/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

Event.on('db:query', Database.prettyPrint)

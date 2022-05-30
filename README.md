# gollum-api

### First install dependencies by running:
```
npm install
```
### Then create a .env file and fill it with:
```
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=YOUR_UNIQUE_KEY
DRIVE_DISK=local
DB_CONNECTION=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=gollum
MYSQL_PASSWORD=YOUR_PASSWORD
MYSQL_DB_NAME=gollum

```

### Then run the migrations
```
node ace migration:run
```

### Then serve the app by running
```
node ace serve -w
```

### To see all available routes, run:
```
node ace list:routes
```

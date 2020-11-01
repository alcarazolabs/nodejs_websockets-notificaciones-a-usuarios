var express = require('express')
const bodyParser = require('body-parser')
var app = express()
var cors = require('cors')
//setup socket.io to listen in the server http
var http = require('http').Server(app)
var io = require('socket.io')(http)

require('./database.js')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())

//importar rutas
const taskRoute = require('./routes/task');
//rutas middlewares
app.use('/api/tasks', taskRoute);



var server = http.listen(3000, ()=>{
    console.log("servidor corriendo en puerto:",
    server.address().port);
});
//configure socket.io object to access in routes file
app.set("socketio", io); 
//app.locals.io = io // this is another way. app.locals is an empty object where you can store variables

/*
* Se debe de crear una colección Users en mongodb. Crear dos usuarios.
* Copiar el _id del usuario 1 y pegarlo dentro index.html
* El _id del usuario 2 pegarlo dentro de user2.html
* Mejor dicho cambiar las constante  const iduser="xxxx"
* Desde un cliente rest como postman o insomia crear una tarea
* el campo 'date' tiene el siguiente formato: Sun Oct 28 2020 22:43:44 GMT-0500
* ver foto 'crear tarea.png' y 'demo index html.png'
*/
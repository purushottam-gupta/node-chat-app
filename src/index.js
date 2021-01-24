const express = require('express');
const socketio = require('socket.io')
const path = require('path')
const http = require('http');
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;

const publicDirectory = path.join(__dirname, '../public')

//Setup static directory to serve
app.use(express.static(publicDirectory))

//if i have 5 clients connected then below fn will run for 5 times
io.on('connection', (socket) => {
    console.log('New WebSocket Conection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome'))// emit to only one who is sending it
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('sendData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // socket.broadcast.emit('message', generateMessage('A new user has joined'))// emit to everone except the new user who has joined

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))// emit msg to everyone connected with that url
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id) 
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('sendData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})


server.listen(port, () => {
    console.log('listening on port ' + port);
})
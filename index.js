const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const {User, connection} = require('./src/models/User')
const hbs = require('hbs')
const genImage = require('./src/scripts/imgGenerator')
const MongoStore = require('connect-mongo')

//-----Servers initialization------
const app = express()
const wsInstance = require('express-ws')(app)
const bodyParser = require('body-parser')
require('dotenv').config()
require('./config/auth')(passport)
const morgan = require('morgan')
const winston = require('./config/winston')
const PORT = process.env.PORT || 3000
//-----Midlleware-----
app.set('view engine', 'hbs')
app.set('views', './src/views')
hbs.registerPartials(__dirname + '/src/views/partials')
hbs.registerHelper('prettyDate', (date) => {
    return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()
})
hbs.registerHelper('drawPath', (url) => {
    return '/d/' + url
})
hbs.registerHelper('upPath', (index) => {
    return '/d/upload/' + index
})
hbs.registerHelper('dPath', (index) => {
    return '/d/dload/' + index
})
app.use(express.json())
app.use(express.urlencoded())
//app.use(morgan('combined', {stream : winston.stream}))
app.use(session({
    secret : 'secret',
    cookie : {maxAge : 1000 * 60 * 60 * 24 * 365},
    saveUninitialized : true,
    store : MongoStore.create(connection)
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.first_msg = req.flash('first_msg')
    res.locals.error = req.flash('error')
    next()
})
app.ws('/:room', (ws, req) => {
    let clients = wsInstance.getWss().clients
    ws.route = req.params.room
    ws.broadcast = (mes) => {
        for(let client of clients){
            if(client.route == ws.route && client != ws) client.send(mes)
        }
    }
    ws.getPeers = () =>{
        let counter = 0
        for(let client of clients){
            if(client.route == ws.route) counter++
        }
        return counter
    }
    //console.log(`${req.user.name} connected. Now there are ${clients.size} connected clients`)
    ws.broadcast(`e:${req.user.name}:${ws.getPeers()}`)
    ws.on('message', (mes) => {
        if(mes == 'gen-img') {
            console.log('Got request on generating an image')
            ws.send('send-img')
        }
        else if(mes.slice(0, 4) == 'f.d;'){
            mes += ';' + req.user.name
            ws.broadcast(mes)
        }
        else if(mes == 'c.u'){
            ws.broadcast(mes)
        }
        else if(mes == 'c.c'){
            mes += ';' + req.user.name 
            ws.broadcast(mes)
        }
        else {
            genImage(mes, 'src/assets/image.png')
            ws.send('save')
        }
    })
    ws.on('close', () => {
        ws.broadcast(`l:${req.user.name}:${ws.getPeers()}`)
    })
})
app.use('/assets', (req, res, next) => {
    if(req.url == '/image.png'){
        User.updateOne({email : req.user.email}, {savedDrawings : req.user.savedDrawings + 1}, (err) => {
            if(err) console.log(err.message)
        })
    }
    next()
}, express.static(__dirname + '/src/assets'))
app.use('/styles', express.static(__dirname + '/src/styles'))
app.use('/scripts', express.static(__dirname + '/src/scripts'))

app.use('/register', require('./src/routes/register'))
app.use('/login', require('./src/routes/login'))

app.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/login')
})
app.use('/d', require('./src/routes/drawings'))
app.use('/', (req, res) => {
    if(!req.user) {
        req.flash('first_msg', 'You need to log in first')
        res.redirect('/login')
    }
    else res.redirect('/d')
})

/*const wss = new WebSocket.Server({server})
wss.on('connection', (ws) => {
    wss.broadcast(`c:${wss.clients.size}`)
    ws.on('message', (mes) => {
        if(mes == 'gen-img') {
            console.log('Got request on generating an image')
            ws.send('send-img')
        }
        else {
            genImage(mes, 'src/assets/image.png')
            ws.send('save')
        }
    })
})
wss.broadcast = (msg) => {
    wss.clients.forEach(function each(client) {
        client.send(msg)
    })
}
server.listen(PORT, () => {
    console.log(`Listening started on port ${PORT}...`)
})*/
app.listen(PORT, () => {
    console.log(`Listening started on port ${PORT}...`)
})
function markRoom(req){
    let rooms =  req.user.rooms
    for(let i = 0;i < rooms.length;i++){
        if(rooms[i].url == req.params.room && rooms[i].owner == req.user.email){
            User.findOne({email : req.user.email})
            .then((user) => {
                user.rooms[i].occupied = !user.rooms[i].occupied
                User.updateOne({email : req.user.email}, {$set : {rooms : user.rooms}}, (err, res) => {
                    if(err) console.log(err.message)
                })
            })
        }
        break
    }
}
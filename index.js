const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path')
const tools = require('./src/scripts/tools')
const MongoStore = require('connect-mongo')

//-----Servers initialization------
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()
const morgan = require('morgan')
const winston = require('./config/winston')
const Jimp = require('jimp')
const PORT = process.env.PORT || 3000
const connection = mongoose.createConnection(process.env.DB_STRING,
{useUnifiedTopology : true, useNewUrlParser : true})

//-----Midlleware-----
app.use(express.json())
app.use(express.urlencoded())
app.use(morgan('combined', {stream : winston.stream}))
app.use(session({
    secret : 'secret_code',
    cookie : {maxAge : 1000 * 60 * 60 * 24 * 365},
    saveUninitialized : true,
    store : MongoStore.create(connection)
}))

app.use('/assets', express.static(__dirname + '/src/assets'))
app.use('/styles', express.static(__dirname + '/src/styles'))
app.use('/scripts', express.static(__dirname + '/src/scripts'))

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/src/login.html')
    res.json()
})
app.post('/login', (req, res) => {
    let {username : name, pass} = req.body
    res.redirect('/')
})

app.use('/studio', (req, res) => {
    res.sendFile(__dirname + '/src/studio.html')
})

app.use('/', (req, res) => {
    if(req.url != '/favicon.ico') {
        if(!req.session.visitCounter) req.session.visitCounter = 1
        else req.session.visitCounter++
        res.sendFile(__dirname + '/src/index.html')
    }
})
const server = http.createServer(app)
const wss = new WebSocket.Server({server})
wss.on('connection', (ws) => {
    ws.on('message', (m) => {
        if(m == 'gen-img') {
            console.log('Got request on generating an image')
            ws.send('send-img')
        }
        else {
            //-----Parsing pixels from transferred ArrayBuffer-----
            let pixels = []
            for(let i = 1;i <= m.length;i += 4) {
                pixels.push(Jimp.rgbaToInt(m[i-1], m[i], m[i+1], m[i+2]))
            }

            //-----Setting pixels to created .png image-----
            let counter = 0
            new Jimp(800, 600, (err, image) => {
                if (err) throw err
                for(let y = 0;y < 600;y++){
                    for(let x = 0;x < 800;x++){
                        image.setPixelColor(pixels[counter], x, y)
                        counter++
                    }
                }
                image.write('src/assets/image.png', (err) => {
                  if (err) throw err
                  ws.send('save') //command for client to begin downloading
                })
            })
        }
    })
})
server.listen(PORT, () => {
    console.log(`Listening started on port ${PORT}...`)
})

const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path')
const MongoStore = require('connect-mongo')
const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 3000
const connection = mongoose.createConnection(process.env.DB_STRING,
{useUnifiedTopology : true, useNewUrlParser : true})
        //Midlleware
app.use(express.json())

app.use(session({
    secret : 'secret_code',
    cookie : {maxAge : 1000 * 60 * 60 * 24 * 365},
    saveUninitialized : true,
    store : MongoStore.create(connection)
}))

app.use('/login', (req, res) => {
    res.sendFile(__dirname + '/src/reg.html')
})

app.use('/', (req, res) => {
    if(req.url != '/favicon.ico') {
        if(!req.session.visitCounter) req.session.visitCounter = 1
        else req.session.visitCounter++
        res.sendFile(__dirname + '/src/index.html')
    }
})

app.listen(PORT, () => {
    console.log(`Listening started on port ${PORT}...`)
})
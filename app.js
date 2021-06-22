const express = require('express')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const {User} = require('./src/models/User')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const hbs = require('hbs')

//-----Servers initialization------
const app = express()
const wsInstance = require('express-ws')(app)
require('dotenv').config()
require('./config/auth')(passport)
const PORT = process.env.PORT || 3000
//-----Midlleware-----
app.set('view engine', 'hbs')
app.set('views', './src/views')
hbs.registerPartials(__dirname + '/src/views/partials')
require('./src/scripts/helpers')()
app.use(express.json())
app.use(express.urlencoded())
mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology : true, 
    useNewUrlParser : true
}).then(mainPart)
function mainPart(){
    app.use(session({
        secret : 'secret',
        cookie : {maxAge : 1000 * 60 * 60 * 24},
        saveUninitialized : true,
        resave : true,
        store : MongoStore.create(mongoose.connection)
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
        require('./src/scripts/serverSocket')(ws, req, clients)
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
    app.use('/set', require('./src/routes/settings'))
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
    app.listen(PORT, () => {
        console.log(`Listening started on port ${PORT}...`)
    })
}
module.exports = app
const express = require('express')
const router = express.Router()
const uuid = require('uuid')
const {User} = require('../models/User')


router.get('/', (req, res) => {
    res.render('drawings.hbs', {rooms : req.user.rooms})
})
router.get('/c', (req, res) => {
    if(req.isAuthenticated()){
        let uri = uuid.v4()
        let newRoom = {
            url : uri,
            name : 'Unnamed',
            date : new Date(),
            env : {
                figures : [],
                fillColor : '#ff0000',
                strokeColor : '#000000',
                canvasColor : '#ffffff'
            }
        }
        User.updateOne({email : req.user.email}, {$push : {rooms : newRoom}}, (err) => {
            if(err) console.log(err.message)
        })
        res.redirect('/d')
    }
    else res.end('Login first')
})
const delRouter = express.Router()
delRouter.get('/:index', (req, res) => {
    let roomNumber = req.params.index
    if(req.isAuthenticated()){
        User.findOne({email : req.user.email}, {rooms : 1})
        .then((user) => {
            let rooms = user.rooms
            rooms.splice(roomNumber, 1)
            User.updateOne({email : req.user.email}, {$set : {rooms : rooms}}, (err) => {
                if(err) console.log(err.message)
            })
        })
        res.redirect('/d')
    }
    else res.end('Login first')
})
router.use('/del', delRouter)
const downRouter = express.Router()
downRouter.get('/:index', (req, res) => {
    let roomIndex = req.params.index
    res.end(JSON.stringify(req.user.rooms[roomIndex].env))
})
const upRouter = express.Router()
upRouter.post('/:index', (req, res) => {
    let roomNumber = req.params.index
    User.findOne({email : req.user.email}, {rooms : 1})
        .then((user) => {
            let rooms = user.rooms
            rooms[roomNumber].env.fillColor = req.body.fillColor
            rooms[roomNumber].env.strokeColor = req.body.strokeColor
            rooms[roomNumber].env.canvasColor = req.body.canvasColor
            rooms[roomNumber].env.figures = req.body.figures
            User.updateOne({email : req.user.email}, {$set : {rooms : rooms}}, (err) => {
                if(err) console.log(err.message)
            })
        })
})
router.use('/dload', downRouter)
router.use('/upload', upRouter)
router.get('/:id', (req, res) => {
    if(req.isAuthenticated()){
        let roomUri = req.params.id
        let userRooms = req.user.rooms
        for(let i = 0;i < userRooms.length;i++){
            if(userRooms[i].url == roomUri){
                let env = userRooms[i].env
                env.roomNumber = i
                res.render('studio.hbs', env)
            }
        }
    }
    else res.redirect('/login')
})
module.exports = router
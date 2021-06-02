const express = require('express')
const router = express.Router()
const uuid = require('uuid')
const {User} = require('../models/User')
router.get('/', (req, res) => {
    res.render('drawings.hbs', 
    {
        rooms : req.user.rooms, 
        name : req.user.name, 
        email : req.user.email
    })
})
router.get('/c', (req, res) => {
    if(req.isAuthenticated()){
        let newRoom = {
            url : uuid.v4(),
            name : 'Unnamed',
            date : new Date(),
            members : [],
            owner : req.user.email,
            env : {
                figures : [],
                fillColor : '#ff0000',
                strokeColor : '#000000',
                canvasColor : '#ffffff'
            }
        }
        User.updateOne({email : req.user.email}, {$push : {rooms : newRoom}}, (err, res) => {
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
                for(let i = 0;i < rooms[roomNumber].members.length;i++){
                    User.findOne({email : rooms[roomNumber].members[i]}, {rooms : 1})
                    .then((user) => {
                        let memRooms = user.rooms
                        for(let j = 0;j < memRooms.length;j++){
                            if(memRooms[j].url == rooms[roomNumber].url){
                                memRooms.splice(j, 1)
                                User.updateOne({email : rooms[roomNumber].members[i]}, {$set : {rooms : memRooms}}, (err) => {
                                    if(err) console.log(err.message)
                                })
                            }
                        } 
                    })
                }
            })
        })
        res.redirect('/d')
    }
    else res.end('Login first')
})
router.use('/del', delRouter)
const renRouter = express.Router()
renRouter.get('/:index', (req, res) => {
    let roomNumber = req.params.index
    let newName = req.query.name
    if(req.isAuthenticated()){
        User.findOne({email : req.user.email}, {rooms : 1})
        .then((user) => {
            let rooms = user.rooms
            rooms[roomNumber].name = newName
            User.updateOne({email : req.user.email}, {$set : {rooms : rooms}}, (err) => {
                if(err) console.log(err.message)
            })
        })
    }
    else res.redirect('/login')
})
router.use('/ren', renRouter)
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
        if(req.query.email){
            User.findOne({email : req.user.email}, {rooms : 1})
            .then((user) => {
                let rooms = user.rooms
                for(let i = 0;i < rooms.length;i++){
                    if(rooms[i].url == req.params.id){
                        for(let member of rooms[i].members) {
                            if(member == req.query.email) return
                        }
                        rooms[i].members.push(req.query.email)
                        User.updateOne({email : req.user.email}, {$set : {rooms : rooms}}, (err, res) => {
                            if(err) console.log(err.message)
                            rooms[i].name = 'Unnamed'
                            rooms[i].members.pop()
                            User.updateOne({email : req.query.email}, {$push : {rooms : rooms[i]}}, (err, res) => {
                                if(err) console.log(err.message)
                            })
                        })
                        break
                    }
                }
            })
        }
        else {
            let roomUri = req.params.id
            let userRooms = req.user.rooms
            for(let i = 0;i < userRooms.length;i++){
                if(userRooms[i].url == roomUri){
                    let env = userRooms[i].env
                    env.roomNumber = i
                    env.name = userRooms[i].name
                    env.userName = req.user.name
                    env.email = req.user.email
                    env.members = userRooms[i].members
                    res.render('studio.hbs', env)
                }
            }
        }
    }
    else res.redirect('/login')
})
module.exports = router
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const {User} = require('../models/User')

router.get('/', (req, res) => {
    res.render('register.hbs')
})

router.post('/', (req, res) => {
    console.log(req.body)
    let {username : name, email, pass1, pass2} = req.body
    let errors = []
    //Passwords match
    if(pass1 != pass2){
        errors.push({msg : 'Passwords do not match'})
    } 
    if(pass1.length < 8){
        errors.push({msg : 'Password should be at least 8 characters'})
    }
    if(errors.length > 0){
        res.render('register.hbs', {
            errors,
            name,
            email,
            pass1,
            pass2
        })
    }
    else {
        //Validation passed
        User.findOne({name : name})
        .then(user => {
            if(user){
                errors.push({msg : 'Username is already used'})
                res.render('register.hbs', {
                    errors,
                    email,
                    pass1,
                    pass2
                })
            }
            else{
                User.findOne({email : email})
                .then(user => {
                    if(user){
                        errors.push({msg : 'Email is already used'})
                        res.render('register.hbs', {
                            errors,
                            name,
                            pass1,
                            pass2
                        })
                    }
                    else{
                        const newUser = new User({
                            name,
                            email,
                            password : bcrypt.hashSync(pass1),
                            rooms : []
                        })
                        newUser.save()
                        .then(() => {
                            req.flash('success_msg', 'You are successfully registered and can login')
                            res.redirect('/login') //redirecting to login page
                        })
                        .catch(err => console.log(err.message))
                    }
                }).catch(err => console.log(err.message))
            }
        }).catch(err => console.log(err.message))
    }
})
module.exports = router
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const {User} = require('../src/models/User')
module.exports = (passport) => {
    passport.use(
        new LocalStrategy({usernameField : 'email', passwordField : 'pass'}, (email, password, done) => {
            User.findOne({email : email})
            .then(user => {
                if(!user){
                    return done(null, false, {message : 'Email not found'})
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) console.log(err.message)
                    if(isMatch){
                        return done(null, user)
                    }
                    else {
                        return done(null, false, {message : 'Incorrect password'})
                    }
                })
            })
            .catch(err => console.log(err.message))
        })
    )
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}
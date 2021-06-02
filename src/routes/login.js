const express = require('express')
const router = express.Router()
const passport = require('passport')
router.get('/', (req, res) => {
  res.render('login.hbs')
})
router.post('/', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/studio',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next)
})
module.exports = router

const express = require('express')
const router = express.Router()
const uuid = require('uuid')
const bcrypt = require('bcryptjs')
const { User } = require('../models/User')

router.get('/', (req, res) => {
  let errors = req.session.errors || null
  res.render('settings.hbs', {
    error: errors,
    user: req.user.name,
    email: req.user.email
  })
  req.session.errors = null
})

router.post('/name', (req, res) => {
  newname = req.body.username
  User.updateOne(
    { email: req.user.email },
    { $set: { name: newname } },
    (err) => {
      if (err) console.log(err.message)
    }
  )
  res.redirect('/set')
})

router.post('/pass', async (req, res) => {
  var passconf = true
  let oldpass = req.body.oldpass
  let newpass = req.body.newpass
  let confpass = req.body.confpass

  const user = await User.findOne({ email: req.user.email })
  const cond1 = await bcrypt.compare(oldpass, user.password)
  const cond2 = newpass.length > 7
  const cond3 = newpass === confpass
  console.log(cond1, cond2, cond3)
  if (!cond1) {
    req.session.errors = 'Password dont exist'
  } else if (!cond2) {
    req.session.errors = 'Password too small'
  } else if (!cond3) {
    req.session.errors = 'Password not confirmed'
  }
  if (cond1 && cond2 && cond3) {
    newpassword = await bcrypt.hashSync(newpass)
    User.updateOne(
      { email: req.user.email },
      { $set: { password: newpassword } },
      (err) => {
        if (err) console.log(err.message)
      }
    )
  }

  res.redirect('/set')
})

module.exports = router

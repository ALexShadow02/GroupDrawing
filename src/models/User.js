const mongoose = require('mongoose')
require('dotenv').config()
const connection = mongoose.createConnection(process.env.DB_STRING,
{useUnifiedTopology : true, useNewUrlParser : true})
const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    savedDrawings : {
        type : Number,
        default : 0
    },
    rooms : Array
})
const User = connection.model('User', UserSchema)
module.exports.User = User
module.exports.connection = connection
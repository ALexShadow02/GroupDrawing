const mongoose = require('mongoose')
require('dotenv').config()
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
const connection = mongoose.createConnection(process.env.DATABASE_URL, {
    useUnifiedTopology : true, 
    useNewUrlParser : true
})
const User = connection.model('User', UserSchema)
module.exports.User = User
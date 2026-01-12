const mongoose=require('mongoose');

const registerSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        minlength:7
    }
    ,
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    }
    })

    module.exports = mongoose.model("registerModel",registerSchema)
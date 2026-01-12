const mongoose = require('mongoose')

// const connectDatabase = async()=>{
//     try{
//         await mongoose.connect('mongodb://127.0.0.1:27017/academy')
//     }
//     catch(err){
//         console.log(err.message)
//     }
// }
const CourseSchema = new mongoose.Schema({
    coursename:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})




module.exports= mongoose.model("CourseDetails", CourseSchema)
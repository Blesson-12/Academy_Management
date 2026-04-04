
const mongoose= require('mongoose')

// const connectDatabase = async()=>{
//     try{
//         await mongoose.connect('mongodb://127.0.0.1:27017/academy')
//     }
//     catch(err){
//         console.log(err.message)
//     }
// }

const EnquirySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String
    },
    course:{
        type:String
    },
    submittedAt:{
        type:Date,
        default:Date.now
    }
})


module.exports=mongoose.model("EnquiryDetails", EnquirySchema)
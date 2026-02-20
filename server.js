const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authorization = require('./routes/authorization')
const app = express()
require("dotenv").config();
const PORT = process.env.PORT || 3000
app.use(express.json())
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB error:", err));
app.use(cors())

app.use('/admin')
app.use('/auth',require('./routes/register'))
app.use('/user',require("./routes/user"))
app.use("/admin",require("./routes/admin"))

process.on('uncaughtException',(err)=>{
  console.log(err.message)
})
app.listen(PORT,(err)=>{
    if(err){
    console.log(err.message)
    }else
    console.log(`Server is running on port ${PORT}`);

})




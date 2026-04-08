const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authorization = require('./routes/authorization')
const app = express()

require("dotenv").config();

const PORT = process.env.PORT || 3000

app.use(express.json())


app.use(cors({
  origin: "https://react-rho-ecru-11.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))


app.options("*", cors())

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB error:", err));

// Routes
app.use('/admin', authorization)
app.use('/auth', require('./routes/register'))
app.use('/user', require("./routes/user"))
app.use("/admin", require("./routes/admin"))

// Error handling
process.on('uncaughtException', (err) => {
  console.log(err.message)
})

// Server start
app.listen(PORT, (err) => {
  if (err) {
    console.log(err.message)
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
})

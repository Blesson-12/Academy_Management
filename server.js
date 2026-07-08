const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authorization = require('./routes/authorization')
const app = express()
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://react-rho-ecru-11.vercel.app",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2
].filter(Boolean);

const isAllowedOrigin = (origin = "") => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin) && origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});

app.use(express.json())
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB error:", err));

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.use('/admin',authorization)
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


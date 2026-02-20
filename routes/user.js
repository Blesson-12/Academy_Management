const express = require("express")
const router = express.Router()

const Course = require("../models/Course")
const Enquiry = require("../models/Enquiry")

router.get('/course',async(req, res,next)=>{
    try{
        const course = await Course.find().sort({createdAt:-1})
        res.json(course)
    }catch(error){
        res.status(500).json({ message: error.message })
    }
})

router.post('/enquiry', async(req,res)=>{
    try{
        const e = await Enquiry.create(req.body);
         res.status(201).json(e)
    }catch(err){
        res.status(500).json({error:'failed to post course'})
    }
})







module.exports= router;



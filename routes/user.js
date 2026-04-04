
const express = require("express")
const router = express.Router()

const Course = require("../models/Course")
const Enquiry = require("../models/Enquiry")
const { sendEnquiryWhatsApp } = require("../services/whatsapp")

router.get('/course',async(req, res,next)=>{
    try{
        const course = await Course.find().sort({createdAt:-1})
        res.json(course)
    }catch(err){
        res.status(500).json({error:"Failed to Fetch Courses"})
    }
})

router.post('/enquiry', async(req,res)=>{
    try{
        const enquiry = await Enquiry.create(req.body);
        let whatsapp = {
            sent:false,
            skipped:true,
            reason:"WhatsApp message was not attempted."
        };

        try{
            whatsapp = await sendEnquiryWhatsApp(enquiry);
        }catch(err){
            console.log("WhatsApp send error:", err.message);
            whatsapp = {
                sent:false,
                skipped:false,
                reason:err.message
            };
        }

         res.status(201).json({enquiry, whatsapp})
    }catch(err){
        res.status(500).json({error:'failed to post course'})
    }
})







module.exports= router;

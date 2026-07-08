
const express = require("express")
const router = express.Router()

const Course = require("../models/Course")
const Enquiry = require("../models/Enquiry")
const { sendEnquiryMail } = require("../services/mail")

const mapCourse = (courseDoc) => {
    const course = courseDoc?.toObject ? courseDoc.toObject() : courseDoc;
    const classValue = (course?.class ?? course?.courseClass ?? "").toString().trim();
    return { ...course, class: classValue };
};

router.get('/course',async(req, res,next)=>{
    try{
        const course = await Course.find().sort({createdAt:-1})
        res.json(course.map(mapCourse))
    }catch(err){
        res.status(500).json({error:"Failed to Fetch Courses"})
    }
})

router.post('/enquiry', async(req,res)=>{
    try{
        const enquiry = await Enquiry.create(req.body);
        let mail = {
            sent:false,
            skipped:true,
            reason:"Email notification was not attempted."
        };

        try {
            mail = await sendEnquiryMail(enquiry);
        } catch (err) {
            console.log("Email send error:", err.message);
            mail = { sent:false, skipped:false, reason: err.message };
        }

        res.status(201).json({ enquiry, mail })
    }catch(err){
        res.status(500).json({error:'failed to post course'})
    }
})







module.exports= router;


const express = require("express")
const router = express.Router();

const Enquiry = require("../models/Enquiry")
const Course = require("../models/Course")

const normalizeCoursePayload = (body = {}) => {
    const coursename = (body.coursename || "").trim();
    const classValue = (body.class || body.courseClass || "").trim();
    const description = (body.description || "").trim();
    const duration = (body.duration || "").trim();
    return { coursename, class: classValue, description, duration };
};

const mapCourse = (courseDoc) => {
    const course = courseDoc?.toObject ? courseDoc.toObject() : courseDoc;
    const classValue = (course?.class ?? course?.courseClass ?? "").toString().trim();
    return { ...course, class: classValue };
};

router.get("/enquiry", async(req, res,next)=>{
    try{
        const list= await Enquiry.find().sort({submittedAt:-1})
        console.log(list)
        res.json(list)
    }catch(err){
        res.status(500).json({error:'Failed to fetch enquiry details'})
    }
})


router.delete('/enquiry/:id', async(req, res,next)=>{
    try{
        await Enquiry.findByIdAndDelete(req.params.id)
        res.json({message:"Deleted enquiry"})
    }catch(err){
        res.status(500).json({error:"Failed to delete Enquiry"})
    }
})
router.delete('/enquiry',async(req,res,next)=>{
    try{
        await Enquiry.deleteMany({})
        res.json({message:"All Enquiries deleted"})
    }catch(err){
        res.status(500).json({error:"Failed to delete all Enquiries"})
    }   
})

router.delete('/course/:id', async(req,res,next)=>{
    try{
    
        await Course.findByIdAndDelete(req.params.id)
        res.json({message:"Course deleted"})
    }catch(err){
        res.status(500).json({error:"Failed to Delete"})
    }
})
router.get('/course',async(req,res)=>{
    try{
        const c = await Course.find().sort({createdAt:-1})
        res.json(c.map(mapCourse))
    }
    catch(err){
        res.status(500).json({error:'Failed to fetch Course details'})

    }
})
router.post('/course', async(req,res,next)=>{
    try{
        const payload = normalizeCoursePayload(req.body);
        if (!payload.coursename || !payload.class || !payload.description) {
            return res.status(400).json({ error: "coursename, class and description are required" });
        }
        const e = await Course.create(payload);
         res.status(201).json(mapCourse(e))
    }catch(err){
        res.status(500).json({error:'failed to post course'})
    }
})

module.exports = router;

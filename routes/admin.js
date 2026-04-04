
const express = require("express")
const router = express.Router();

const Enquiry = require("../models/Enquiry")
const Course = require("../models/Course")

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
        res.json(c)
    }
    catch(err){
        res.status(500).json({error:'Failed to fetch Course details'})

    }
})
router.post('/course', async(req,res,next)=>{
    try{
        const e = await Course.create(req.body);
         res.status(201).json(e)
    }catch(err){
        res.status(500).json({error:'failed to post course'})
    }
})

module.exports = router;

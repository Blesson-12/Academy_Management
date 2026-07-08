
const express=require('express')
const router = express.Router();
const registerModel = require("../models/register");
const bcrypt = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken');
router.route('/register').post(async(req,res)=>{
     try{
        const pass = await bcrypt.hash(req.body.password,7);
        const obj = {userName:req.body.userName,email:req.body.email,password:pass,role:req.body.role};
        await registerModel.create(obj);
        res.status(201).send("user registered succesfully");
     }
     catch(err){
        console.log(err);
     }
})

router.route('/login').post(async(req,res)=>{
    try{
        const userExists =await registerModel.findOne({email:req.body.email});
        if(!userExists){
            return res.status(400).json({ message: "enter valid credentials" });
        }
        const pass =await bcrypt.compare(req.body.password,userExists.password)
        if(!pass){
             return res.status(400).json({ message: "enter valid credentials" });
        }
        const token = jsonwebtoken.sign({id:userExists._id,role:userExists.role},process.env.SECRET_KEY,{expiresIn:"1d"})
        res.status(200).json({token});
    }
    catch(err){
       console.log(err.message)
       return res.status(500).json({ message: "Login failed" });
    }
})

module.exports=router;

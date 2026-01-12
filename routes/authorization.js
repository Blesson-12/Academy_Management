  const jwt = require("jsonwebtoken");
  const express = require("express")
  const authorize = (req,res,next)=>{
      const token = req.headers.authorization?.split(" ")[1];
      if(!token){
          return res.status(401).send("please sign in to access this page")
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if(decoded.error){
          return res.status(401).send("please sign in to access this page")
      }
      req.user = decoded;

      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "you dont have access" });
      }

      next();
    };


  module.exports =authorize;
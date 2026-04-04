

const jsonwebtoken=require('jsonwebtoken');

const checkAuthorization = (req,res,next)=>{
    const token = req.header('Authorizaton')

    if(!token){
        req.redirect('../view/login.html')
    }
    jsonwebtoken.verify(token,process.env.SECRET_KEY,(err,obj)=>{
        if(err){
            console.log(err)
        }
        req.user=obj;
        next();
    })
}


module.exports = checkAuthorization

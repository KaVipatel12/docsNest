const User = require("../models/user-model");
const  jwt  = require("jsonwebtoken");
const authUser = async (req , res , next) => {
    try{
        const token = req.header('Authorization'); 
        if(!token){
            return res.status(400).send({msg : "Authentication failed"});
        } 

        const jwtToken = token.replace("Bearer", "").trim(); 
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);
        if (isVerified) {
            const userData = await User.findOne({ email: isVerified.email });
            if (!userData) {
                return res.status(404).json({ msg: "User not found" });
            }
            req.user = userData;  // sending the userdata to the main page. 
            next(); 
        } else {
            return res.status(500).json({ msg: "Please login to procced further"});
        }
    }catch(err){
        err.status = 500; 
        next(err); 
    }
}

module.exports = authUser; 
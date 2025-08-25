import jwt from "jsonwebtoken";
import User from "../models/User.js";


 export const protect = async (req, res, next) => {
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith('Bearer ')) {
     return res.json({success: false, message: "Unauthorized"});
   }

   const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

   try {
     const userId = jwt.verify(token, process.env.JWT_SECRET); // Use verify instead of decode

     if(!userId){
       return res.json({success: false, message: "Unauthorized"});
     }

     req.user = await User.findById(userId).select("-password");
     next();
   } catch (error) {
     return res.json({success: false, message: "Unauthorized"});
   }
 }
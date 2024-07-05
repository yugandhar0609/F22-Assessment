import UserDB from "../Models/UserModels.js";
import jwt from "jsonwebtoken";

// const jwtSecret = process.env.jwt_Token;
// const generateJWTToken = (data) => {
//   let token = jwt.sign({ id: data }, jwtSecret, { expiresIn: "7d" });
//   return token;
// };


export const VerifyAuthToken = async(req,res,next)=>{
    let authHeader  = req.headers.authorization

    if (!authHeader ) {
        return res.status(401).json({ message: "User must be logged in." });
      }
    
      let token = authHeader.split(" ")[1]
      if (!token ) {
        return res.status(401).json({ message: "Access denied, no token provided" })
      }
      try {
        const payload = jwt.verify(token,jwtSecret)
        const user = await UserDB.findById(payload.id)
        if (!user) {
            return res.json({
              message: "User Not Available",
            });
        }
        req.user = user._id
        return next();

      } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(500).json({ message: "Failed to authenticate user" });
      }
}
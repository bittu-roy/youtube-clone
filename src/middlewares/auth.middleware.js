import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHanlder"
import { jwt } from "jsonwebtoken"
import { User } from "../models/user.model"

// we used (req, _, next) _-> resposne but we are not using response so we write _ here.
export const verifyJWT= asyncHandler(async(req, _, next)=>{
    try{
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
           throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
           throw new ApiError(401, "Invalid Access Token")
        }

        req.user= user;
        //this next() is used to move on to the next method or process.
        next()
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid access token")
    }

}) 



//we built this middleware for our logoutUser and later on also it will be used  to count likes....etc.
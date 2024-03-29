import {asyncHandler} from "../utils/asyncHanlder.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


//a function to generate access and refresh tokens.
const generateAccessAndRefreshTokens= async(userId)=>{ 
    try{
         //finding user by id.
         const user= await User.findById(userId)
         
         //generating access and refresh token
         const accessToken= user.generateAccessToken()
         const refreshToken= user.generateRefreshToken()
         
         //adding and saving refresh token to our database
         user.refreshToken= refreshToken
         await user.save({ validateBeforeSave: false })

         //return access token and regfresh token
         return{accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser= asyncHandler(async(req, res)=>{
    
    //this method will help us to register a user
    //steps to follow in registerUser:-
        //1.get user details from frontend.
        //2.validate everything-  whether email is in correct format or not
        //3. check if user already exist- through email, username..
        //4. check for images, avatar.
        //5. upload them to cloudinary, also doa avatar check whether it has been uploaded to cloudinary or not from localStorage (multer)
        //6. create user object- because we need to store it in our DB nad for that we nee to pass it in objects using .create
        //7. remove password and response filed from the response
        //8. finally return our RESPOSNE.
    
    
    
    //1.get user details from frontend.
    const {fullname, username, email, password}= req.body
    //console.log("email:", email);
    
    //2.validate everything-  whether all the fields are empty or not
    if(
        [fullname, username, email, password].some((field)=>
        field?.trim=== "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    
    //3. check if user already exist- through email, username..
    const existedUser= await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists")
    }

     //4. check for images, avatar.
     const avatarLocalPath= req.files?.avatar[0]?.path;
     //const coverImageLocalPath= req.files?.coverImage[0]?.path;
    
    //here basicalyy we are checking whether is someone doesn't upload coverImage then there should not be any error. 
    //isArray-> checks whether properly Array has come or not for the argument provided. 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length> 0){
        coverImageLocalPath= req.files.coverImage[0].path;
    }

     if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
     }

     //5. upload avatar, coverImage to cloudinary, also do a avatar check whether it has been uploaded to cloudinary or not from localStorage (multer)
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    //6. create user object- because we need to store it in our DB nad for that we nee to pass it in objects using .create
    const user= await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //checking if user is created or not && 
    //7. removing password and response filed from the response
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }
    
    //8. finally return our RESPOSNE.
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})



const loginUser= asyncHandler(async(req, res)=>{
      
    //1. bring data from req.body
    //2. username or email base to login
    //3. find the user
    //4. password check
    //5. access and refresh token
    //6. send cookies

    //1. bringing data from req.body   
    const {email, username, password}= req.body
    console.log(email);

    //2. checking if username or email exists or not
    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    //3. finding the user based on email or username by using a mongoDB method
    const user= await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    
    //4. doing a password check and we are passing user's 'password' as the password which is saved in our databse is 'this.password'
    const isPasswordValid= await user.isPasswordCorrect(password) 

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
    }
    
    //5. returning access token and refresh token
    const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)
    
    //Now what happens we have access of the user which is present inside loginUser and so it has some unwanted field which it will return to the user like password and also the refresh token is empty as we have the reference of user which is present inside loginUser so we make another DATABASE_QUERY. and using .select() we are not returning the password as well as the refresh token field.
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
    
    //6. sending cookies
    //by default anyone can modify cookies in the frontend but using "httpOnly && secure"--> these cookies will only get modified from the server side.
    const options={
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
               user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
    
    
})


const logoutUser= asyncHandler(async(req, res)=>{
     
    //steps to follow in logout
    //1. reset refresh tokens
    //2. clear cookies
    await User.findByIdAndUpdate(
        //deleting/updating refresh token
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    
    //removing cookies
    const options={
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
          new ApiResponse(
               200, 
               {}, 
               "User logged Out"
            )
        )
})


//making a refresh token end point
const refreshAccessToken= asyncHandler(async(req, res)=>{
     const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

     if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
     }

     
    try{
        const decodedToken= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user= await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
    }
        //now we are verifying whether the refresh token of the user is same as the refresh token present in database.
    if(incomingRefreshToken!== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options= {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    const {accessToken, newRefreshToken}= await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )
    )
    }
    catch(error){
        throw new ApiError(401, error?.message|| "Invalid Refresh Token")
    }

})

//changing password
const changeCurrentPassword= asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword}= req.body
    
    const user= await User.findById(req.user?._id)
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    //setting new password if old password is correct
    user.password= newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

//creating an endpoint to get current user.
const getCurrentUser= asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "current user fetched successfully"
        )
    )
})

//updating account details
const updateAccountDetails= asyncHandler(async(req, res)=>{
    const {fullname, email}= req.body

    if(!fullname || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Account details updated successfully"
    ))
})

//updating avatar image
const updateUserAvatar= asyncHandler(async(req, res)=>{
    const avatarLocalPath= req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "avatar uploaded successfully"
        )
    )
})


//updating cover image
const updateUsercoverImage= asyncHandler(async(req, res)=>{
    const coverImageLocalPath= req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Cover Image updated successfully"
        )
    )
})

//getting user channel profile data
const getUserChannelProfile= asyncHandler(async(req, res)=>{
     const {username}= req.params

     if(!username?.trim()){
        throw new ApiError(400, "username is missing")
     }

     const channel= await User.aggregate([
         {
            $match:{
                username: username?.toLowerCase()
            }
         },
         {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
         },
         {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
         },
         {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
         },
         {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
         }
     ])

     if(!channel?.length){
        throw new ApiError(404, "channel does not exists")
     }

     return res
     .status(200)
     .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel fetched successfully"
        )
     )
})

//getting watch history
const getWatchHistory= asyncHandler(async(req, res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            "localField": "owner",
                            foreignField: "_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory
}


//Now we have created our method but when should we use our method..? whenever a URL gets hit then it should run for that we need routes and now inside routes folder we will create multiple routes.
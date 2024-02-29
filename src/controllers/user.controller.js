import {asyncHandler} from "../utils/asyncHanlder.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
const registerUser= asyncHandler(async(req, res)=>{
    
    //1.get user details from frontend.
    const {fullname, username, email, password}= req.body
    console.log("email:", email);
    
    //2.validate everything-  whether all the fields are empty or not
    if(
        [fullname, username, email, password].some((field)=>
        field?.trim=== "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    
    //3. check if user already exist- through email, username..
    const existedUser= User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists")
    }

     //4. check for images, avatar.
     const avatarLocalPath= req.files?.avatar[0]?.path;
     const coverImageLocalPath= req.files?.coverImage[0]?.path;
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

//Now we have created our method but when should we use our method..? whenever a URL gets hit then it should run for that we need routes and now inside routes folder we will create multiple routes.

export {registerUser}
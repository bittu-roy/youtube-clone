import {asyncHandler} from "../utils/asyncHanlder.js"

//this method will help us to register a user
const registerUser= asyncHandler(async(req, res)=>{
    res.status(200).json({
        message: "OK"
    })
})

//Now we have created our method but when should we use our method..? whenever a URL gets hit then it should run for that we need routes and now inside routes folder we will create multiple routes.

export {registerUser}
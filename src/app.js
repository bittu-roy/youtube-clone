import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express()

app.use(cors({
    origin: process.env.PORT,
    credentials: true
}))

//Data can come from multiple places like from database, directly in form of json format and so we need to set some settings and also set limit and we do so by using app.use().
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb"})) //URLS generally convert special characters like it coverts space--> %20 and to make express understand we use this urlencoded
app.use(express.static("public"))// here basically if we want to store certain images or files in public just like our public folder. 
app.use(cookieParser()) //here what happens is we can perform crud operations on the cookies of the users browser

//routes import
import userRouter from "./routes/user.routes.js"


//routes declaration: -basically we will use middlewares
app.use("/api/v1/users", userRouter)
//the above syntax means something like this:- https://localhost:8000/api/v1/users/register
//here basically we mention the path(controller) and the it moves in the controller and uses register.


export {app};
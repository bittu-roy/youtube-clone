import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

//calling our function which connects the database.
connectDB()
.then(()=>{
    app.on((error)=>{
        console.log("ERROR: ", error);
        throw error
    })
    app.listen(process.env.PORT|| 8000, ()=>{
        console.log(`Server is running at ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log(`MongoDB connection falied!!`, error)
})

// const app= express()

// ;(async()=>{
//      try{
//          await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//          app.on("error: ", (error)=>{
//             console.log("ERROR: ", error)
//             throw error
//          })

//          app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening on PORT ${process.env.PORT}`);
//          })
//      }
//      catch(error){
//          console.error("ERROR: ", error)
//          throw error
//      } 
// })()

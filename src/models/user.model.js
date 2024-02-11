import mongoose, {Schema} from "mongoose";
import { jwt } from "jsonwebtoken";   //These both frameworks help us to encrypt our data
import bcrypt from "bcrypt";

//We cannot do encryption directly so we need the help of some mongoose hooks (middleware hooks).
//1. Pre hook-  just before our data gets saved we can run this hook to execute our code.

const userSchema= new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //if we want to enable searching field for any particular field we need to make our index: true as it is a better option but we should only use it where searching is needed otherwise it may hamper the overall performance.
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,  //cloudinary URL
            required: true
        },
        coverImage:{
           type: String,  //cloudinary URL
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken:{
            type: String
        }

        
    },
    {
        timestamps: true
    }
)

//This is basically a middleware. Here we are using pre() to encrypt our password
//Generally inside pre we pass 1. functionality(save) and a call back function where we will execute our code.   
//We should not write the call back function inside our pre as '()=>{}' as arrow function doesn't contains 'this reference'/ doesn't know the context.
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){    //Here we are checking if password is not modified then simply return next and we don't need to encrypt it.
        return next();
    }
    
    //Here password encryption takes place only if password is modified 
    this.password= bcrypt.hash(this.password, 10)
    next()
})

//Now we have to check whether the password which user has given is correct or not because the password saved in our database is encrypted but user will enter the password in string format.
//So for that we will use methods.

userSchema.methods.isPasswordCorrect= async function(password){
      return await bcrypt.compare(password, this.password) //checking if our password is correct or not 1. password- from user, 2. this.password- password present in DB
}

//Now we will put use to JWT tokens..

userSchema.methods.generateAccessToken= function(){
    //using sign() we generate token 
    return jwt.sign(
        {
           _id: this._id,
           email: this.email,
           username: this.username,
           fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
     )
}

//generating refresh tokens-- it is same as the access tokens but as it gets refershed quite frequently, that's why we only pass limited information (payload) to it. and also the expiry of refresh tokens are much longer than access tokens.

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
           _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
     )
}

export const User= mongoose.model("User", userSchema)
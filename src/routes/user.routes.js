import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router()
//just before registerUser we will use multer middleware to handle multiple files--> avatar and coverImage
router.route("/register").post(
    //using middleware
    upload.fields([
        {
           name: "avatar",
           maxCount: 1
        },
        {
           name: "coverImage",
           maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router;
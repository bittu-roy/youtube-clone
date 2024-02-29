import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router= Router()
//just before registerUser we will use multer middleware to handle multiple files--> avatar and coverImage
router.route("/register").post(
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

export default router;
import { Router } from "express";
import { registerUser , loginUser , logOutUser} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

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
    registerUser)

router.route("/login").post(loginUser)

//secure routes

router.route("/logout").post(verifyJwt,logOutUser)

export default router
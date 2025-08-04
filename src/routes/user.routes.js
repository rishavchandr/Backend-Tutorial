import { Router } from "express";
import { registerUser , 
         loginUser , 
         logOutUser , 
         refreshAccessToken, 
         changeCurrentPassword, 
         getCurrentUser, 
         UpdateUserAccountDetails,
          UpdateUserAvatar, 
          UpdateUserCoverImage, 
          getUserChannelProfile, 
          getUserWatchHistory} from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt,changeCurrentPassword)
router.route("/current-user").get(verifyJwt,getCurrentUser)
router.route("/update-account").patch(verifyJwt,UpdateUserAccountDetails)
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),UpdateUserAvatar)
router.route("/coverImage").patch(verifyJwt,upload.single("coverImage"),UpdateUserCoverImage)
router.route("/c/:username").get(verifyJwt,getUserChannelProfile)
router.route("/history").get(verifyJwt,getUserWatchHistory)

export default router
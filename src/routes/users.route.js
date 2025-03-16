import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccounDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from '../controllers/users.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

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

router.route("/login").post(loginUser)

//Secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccounDetails),
    router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar), //post method update whole field thats why used patch to update user avatar
    router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)
router.route('/c/:username').get(verifyJWT, getUserChannelProfile),  //this path is used to pass params in url
    router.route('/history').get(verifyJWT, getWatchHistory)

export default router;
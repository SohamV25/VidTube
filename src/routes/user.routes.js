import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();


//unsecured route

//1.
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//2.login the user where we take credential from the user in body we check the password and then we send res back to user with cookies
router.route("/login").post(loginUser)

//3.we check incoming refresh token if it is valid we give back the user both the refresh and access token
router.route("/refresh-token").post(refreshAccessToken)


//Secured routes

//we get the user from req.user and delete/undefine the refreshToken field in user model
router.route("/logout").post(verifyJWT ,logoutUser)

//4.we get the user from req.user and update the password field
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

//5.we directly send the user from req.user 
router.route("/current-user").get(verifyJWT, getCurrentUser)

//6.here we get the username from url and use aggregation pipeline to return the CHANNEL
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

//7.we do get the user from the request then we - User.findByIdAndUpdate the fullname, email
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

//8.here we will receive fils from the user hence we have to use cloudinary middleware
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)

//8.here we will receive fils from the user hence we have to use cloudinary middleware
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)

//9.we will get the user from verifyJWT, using aggregation pipeline we fetch the data
router.route("/history").get(verifyJWT, getWatchHistory)



export default router;

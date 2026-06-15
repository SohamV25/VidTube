import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// _ used this because we are not sending any response
export const verifyJWT = asyncHandler(async(req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")//first check the cookie if not check the header the header will have key value pairs with the key as Authorization and the token after Bearer (we are editing it)

    if(!token){
        throw new ApiError(401, "unauthorized")
    }

    try {
        //decoded token -> get the key from the env file use it to unlock the incoming token if it was used to lock using the same key it will give the token back in decoded token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        //we have used a method called generateAccessToken or generateRefreshToken in which we are storing _id using that we are finding the use and while getting back ignoring the password and refreshToken
        const user = await User.findById(decoded?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Unauthorized")
        }

        //We are adding new field in the req object named user where all the filed are saved except password and refreshToken
        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})
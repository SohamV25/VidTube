import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import {deleteFromCloudinary} from "../utils/cloudinary.js"

const generateAccessAndRefreshToken = async(userId) => {
  try{
    const user = await User.findById(userId)

    if(!user){
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})
    return {accessToken, refreshToken}
  }catch(error){
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
  }
}

//register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  //validation
  if (
    [fullname, email, username, password].some((field) => !field || field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or : [{username},{email}]
  })

  if(existedUser){
    throw new ApiError(409, "User already exists");
  }

  console.warn(req.files)

  //this is given by multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path
  const coverLocalPath = req.files?.coverImage?.[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing");
  }

  // const avatar = await uploadOnCloudinary(avatarLocalPath)
  // let coverImage = ""
  // if(coverLocalPath){
  //   coverImage = await uploadOnCloudinary(coverLocalPath)
  // }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar");
    }
    console.log("Uploaded avatar", avatar)
  } catch (error) {
    console.log("Error uploading avatar", error)
    throw new ApiError(500, "failed to upload Avatar");
  }

  let coverImage;
  try {
    if (coverLocalPath) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
  }
  } catch (error) {
    console.log("Error uploading avatar", error)
    throw new ApiError(500, "failed to upload Cover Image");
  }

  try {
    const user = await User.create({
      fullname,
      avatar : avatar.url,
      coverImage : coverImage?.url || "",
      email,
      password,
      username : username.toLowerCase()
    })
  
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
  
    if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering a user");
    }
  
    return res
      .status(201)
      .json( new ApiResponse(201, createdUser, "User registered successfully!"))
  } catch (error) {
    console.log("User Creation failed", error.message);
    console.log(error);

    if(avatar){
      await deleteFromCloudinary(avatar.public_id)
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id)
    }

     throw new ApiError(500, "Something went wrong while registering a user and images were deleted");
  }

});

//help user login
const loginUser = asyncHandler(async (req, res) => {
  const {email, username, password} = req.body

  //validation
  if(!email){
    throw new ApiError(400, "Email is required");
  }

  //Check if the user already exists
  const user = await User.findOne({
    $or : [{username},{email}]
  })

  if(!user){
    throw new ApiError(404, "User not found")
  }

  //validate password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid credentials")
  }

  const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if(!loggedInUser){
    throw new ApiError(404, "User not found");
  }

  const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production"
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {user: loggedInUser, accessToken, refreshToken},
        "User logged in successfully"
      )
    )
})



export { 
  registerUser,
  loginUser
};

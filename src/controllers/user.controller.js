import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {clodinaryUploadMethod} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res) => {
   // get details from the user
   //validate the details from the user
   //check if user already exists (through username or email)
   //check for images / or avatar as require
   //upload files or images to the 
   //from where avatar check at multer as well as cloudinary 
   //create a user object -> create entry in DB
   //remove the password and reference token form the field form response
   //check user creation 
   //return response 

   const {username , email , fullName , password} = req.body
  // console.log("Request Body : " , req.body)

   if(
      [fullName , email , username , password].some((field) => field?.trim() === "")
   ){
      throw new ApiError(400,"user details not found ")
   }

const exitedUser = await User.findOne({
    $or: [{username}, {email}]
})

if(exitedUser){
    throw new ApiError(409, "User with email or username already exist")
}
//console.log("Request files: ",req.files)


const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar is required")
}

const avatar = await clodinaryUploadMethod(avatarLocalPath)
const coverImage = await clodinaryUploadMethod(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400 , "Avatar is required")
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url  || "",
    email,
    password,
    username: username.toLowerCase()
   })

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registering new User")
}


return res.status(201).json(
    new ApiResponse(200,createdUser,"User created Successfully")
)

})


export {registerUser}
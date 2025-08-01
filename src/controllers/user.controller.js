import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {clodinaryUploadMethod} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";

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

const getUserRefreshAndAccessToken  =  async(userId) =>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ vailadateBeforeSave : false })

        return {refreshToken , accessToken}
    } catch (error) {
        throw new ApiError(500 , "Something went Wrong at genrating Refresh and Access Token")
    }
}
const loginUser = asyncHandler(async (req , res ) => {
  // req body -> data
  //username or email
  // check for user
  //check the password
  //access and refresh Token 
  //send cookie

  const {username , email , password} = req.body

  if(!(username || email)){
    throw new ApiError(400 , "username or email is required")
  }

  const user = await User.findOne({
    $or: [{username} , {email}]
  })

  if(!user){
    throw new ApiError(404 , "User doesnot Exist")
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password)

  if(!isPasswordCorrect){
    throw new ApiError(401 , "Invaild user credentials")
  }

  const {accessToken , refreshToken} = await getUserRefreshAndAccessToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken" , accessToken , options)
  .cookie("refreshToken", refreshToken , options)
  .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser,accessToken,refreshToken
         },
         "User logged In SuccesFully"
      )
  )
})

const logOutUser = asyncHandler(async(req , res) =>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
     )

     const options = {
        httpOnly: true,
        secure: true
    }

     return res
     .status(200)
     .clearCookie("accessToken" , options)
     .clearCookie("refreshToken" , options)
     .json(new ApiResponse(
        200,
        {},
        "User Logout SuccessFully"
     ))

})

const refreshAccessToken = asyncHandler(async(req , res) =>{
       const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

       if(!incomingRefreshToken){
          throw new ApiError(401 , "Unauthorized Access") 
       }

       try {
        const decodedToken =  jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
 
        const user = await User.findById(decodedToken?._id)
 
        if(!user){
         throw new ApiError(401 , "Invalid refresh Token")
        }
 
        if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(401 , "Refresh Token has been expired or used")
        }
 
        const options = {
          httpOnly: true,
          secure: true
        }
 
        const {accessToken , newRefreshToken} = await genrateAccessToken(user._id)
 
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
         new ApiResponse(
             200,
             {accessToken , newRefreshToken},
             "Access Token Successfully"
         )
        )
       } catch (error) {
           throw new ApiError(401 , error?.message || "Invaild token")
       }
})



export {registerUser ,
        loginUser , 
        logOutUser , 
        refreshAccessToken}
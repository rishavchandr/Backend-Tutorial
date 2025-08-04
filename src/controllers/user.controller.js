import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {clodinaryUploadMethod , cloudinaryUploadToRemove } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";

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

    // data base query to check from the user id and according update the refresh token
    //send cookies 

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


const changeCurrentPassword = asyncHandler(async(req , res) =>{
    
    const {oldPassword , newPassword} = req.body
    
    const user = User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invaild Password ")
    }

    user.password = newPassword
    
    await user.save({vailadateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password is changed successfully"))
})

const getCurrentUser = asyncHandler(async(req , res) =>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current User Fetch SuccessfUlly"))
})

const UpdateUserAccountDetails = asyncHandler(async(req , res) =>{
    const {fullName , email} = req.body

    if(!fullName || !email){
        throw new ApiError(401 , "Fields are Empty")
    }

    const user = await User.findByIdAndUpdate(
          req.user._id,
          {
             $set: {
                fullName: fullName,
                email: email
             }
          },
          {
            new: true
          }
        ).select("-password")


     return res
     .status(200)
     .json(new ApiResponse(200 , user , "User details Updated Successfull"))
})

const UpdateUserAvatar = asyncHandler(async(req , res) =>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is Missing")
    }

   const avatar =  await clodinaryUploadMethod(avatarLocalPath)

   if(!avatar.url){
     throw new ApiError(400 , "Error while uploading the avatar to cloudinary")
   }

   const oldUser = await User.findById(req.user?._id).select("avatar")
   const oldAvatarUrl = oldUser?.avatar

   const user = await User.findByIdAndUpdate(
       req.user?._id,
       {
          $set: {
               avatar: avatar.url
          }
       },
       {new: true}
   ).select("-password")


   if(oldAvatarUrl){
      await cloudinaryUploadToRemove(oldAvatarUrl)
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200 , user , "Avatar is uploaded SuccessFully")
   )
})

const UpdateUserCoverImage = asyncHandler(async(req , res) =>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400 , "coverImage is missing")
    }

    const coverImage =  await clodinaryUploadMethod(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400 , "Error while uploading at the cloudinary")
    }
    
    const oldUser = await User.findById(req.user?._id).select("coverImage")
    const oldCoverImageUrl = oldUser?.avatar

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

     if(oldCoverImageUrl){
        await cloudinaryUploadToRemove(oldCoverImageUrl)
     }

    return res
   .status(200)
   .json(
    new ApiResponse(200 , user , "coverImage is uploaded SuccessFully")
   )
})

const getUserChannelProfile = asyncHandler(async(req , res) =>{
       
       const {username} = req.params

       if(!username?.trim()){
           throw new ApiError(400 , "Username not found")
       }

      const channel =  await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                for: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                for: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400 , "User doesnot exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel[0] , "User channel fetched Successfully")
    )
})

const getUserWatchHistory = asyncHandler(async(req,res) =>{

   const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.objectId(req.user?._id)
            }
        },
        {
            $lookup: {
                for: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            for: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        user[0].watchHistory,
        "watch History fetched Successfully"
    ))
})


export {registerUser ,
        loginUser , 
        logOutUser , 
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        UpdateUserAccountDetails,
        UpdateUserAvatar,
        UpdateUserCoverImage,
        getUserChannelProfile,
        getUserWatchHistory}
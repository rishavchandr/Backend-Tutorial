import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        require: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String , // clodinary url
        require: true
    },
    coverImage: {
        type: String
    },
    password: {
        type: String,
        require: [true , 'password is required']
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String
    }


},{timestamps: true})


userSchema.pre("save" , async function(next){
    if(!this.isModified("password") && this.password) return next();
    if(this.password){
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User" , userSchema)
//require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("Connection falid : " , error)
})

















/*import express from "express";
const app = express()
;(async () => {
    try {
      
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error" ,(error) =>{
            console.log("express Error:" , error);
            throw error;
        })

        app.listen(process.env.PORT , ()=>{
            console.log(`App is listinig to ${process.env.PORT}`)
        })
        
    } catch (error) {
        console.error("Error is" , error);
        throw error
    }
})()
*/
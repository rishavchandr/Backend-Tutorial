import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = (async () =>{
    try {
       const connetionIntance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\nMongoDb connected !! db host ${connetionIntance.connection.host}`);
    } catch (error) {
        console.log("Mongoose DB connect error : " , error)
        process.exit(1)
    }
})

export default connectDB

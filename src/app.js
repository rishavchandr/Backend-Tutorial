import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

//cors configure 
app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    Credential: true
}))

//configure for the app tha is express
app.use(express.json({limit: "16kb"})) // use to take response and request the json files
app.use(express.urlencoded({extended: true , limit: '16kb'})) // use to handle the url special charater as paramas
app.use(express.static("public")) // folder name public /we can use any . it use to stores files as pdf image or videos 
app.use(cookieParser())

export {app}
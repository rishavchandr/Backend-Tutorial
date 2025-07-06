import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


// Configuration
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_CLOUD_API_KEY , 
        api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});
    

const clodinaryUploadMethod = async (localUrlPath) => {
    try {
        if(!localUrlPath) return null
        //upload file in the cloudinary
        const response = await cloudinary.uploader.upload(localUrlPath , {
            resource_type: "auto"
        })
        //file has been successfully uploaded 
        console.log("file has been uplaoded at cloudinary : " , response.url);
        return response
    } catch (error) {
        //if there is any error in file then first unlink or remove the file from local server 
        fs.unlinkSync(localUrlPath);

        return null;
    }
}

export {clodinaryUploadMethod}
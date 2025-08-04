import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError.js";


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
        //console.log("file has been uplaoded at cloudinary : " , response.url);
        fs.unlinkSync(localUrlPath)
        //console.log("cloudinay Response :", response)
        return response
    } catch (error) {
        //if there is any error in file then first unlink or remove the file from local server 
        fs.unlinkSync(localUrlPath);

        return null;
    }
}

const cloudinaryUploadToRemove = async(cloudinayUrl) => {
     try {
        const publicId = getPublicId(cloudinayUrl)
        
        const result = await cloudinary.uploader.destroy(publicId , {
            resource_type: "auto"
        })
        
        return result
     } catch (error) {
         throw new ApiError(500 , "Enable to delete  assert from cloudinary")
     }
}

function getPublicId(url) {
    const parts = url.split('/')
    const fileWithExt = parts.pop();
    const folder = parts.slice(parts.indexOf('upload') + 1).join('/');
    const fileName = fileWithExt.split('.')[0]
    return folder ? `${folder}/${fileName}` : fileName
}

export {clodinaryUploadMethod , cloudinaryUploadToRemove}
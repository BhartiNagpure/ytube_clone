import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {

    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        return null;
    }
}



export {uploadOnCloudinary}


// const uploadOnCloudinary = async (localFilePath)=>{
//     try{
//       if(!localFilePath) return null;
//       console.log("Uploading file to Cloudinary...", localFilePath);

//       const response = await cloudinary.uploader.upload(localFilePath, {
//         resource_type: "auto",
//       })
//       console.log("file is uploaded on localpath ", response.url)
//       fs.unlinkSync(localFilePath)
//       return response
//     }catch(e){
//         fs.unlinkSync(localFilePath) //remove locally save temp file
//         return null;
//     }
// }



// export default uploadOnCloudinary;
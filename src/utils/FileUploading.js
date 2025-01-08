import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
      cloud_name: 'ytubeclone' ,
      api_key: '738793688189774',
      api_secret: 'BnqVrvMG3eh_i65mLQgHuuAMm4A'
  });
  

const uploadOnCloudinary = async (localFilePath)=>{
    try{
      if(!localFilePath) return null;
      const response = cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      })
      console.log("file is uploaded on localpath ", response.url)
      return response
    }catch(e){
        fs.unlinkSync(localFilePath) //remove locally save temp file
    }
}



export default uploadOnCloudinary;
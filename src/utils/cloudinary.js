import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const getPublicIdFromUrl = (url) => {

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);

  if (!match){
    return null;
  };

  return match[1];

};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (url) => {
  try {
    const publicId = getPublicIdFromUrl(url);
    
    if (!publicId) {
      throw new ApiError(500,"Invalid Cloudinary URL format.");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true 
    });

    console.log("Deletion Response:", result);
    return result; 
  } catch (error) {
    throw new ApiError(500,"error while deleting cloudinary asset")
  }
};



export {uploadOnCloudinary, deleteFromCloudinary}
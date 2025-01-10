import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './apiError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath)
      throw new ApiError(400, 'No file path provided for upload');
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: 'Ecommerce_MERN',
    });
    // file has been successfully uploaded
    // console.log(
    //   "File has been successfully uploaded on cloudinary",
    //   response.url
    // );
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as upload operation failed
    fs.unlinkSync(localFilePath);
    throw error;
  }
};

const deleteOnCloudinary = async (fileUrl, fileType) => {
  try {
    const publicId = fileUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId, {
      resource_type: fileType,
    });
  } catch (error) {
    throw error;
  }
};

export { deleteOnCloudinary, uploadOnCloudinary };

import cloudinary from "../config/cloudinary.js";
import ApiError from "./ApiError.js";

const handleCloudinaryUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "Product_images" },
            (error, result) => {
                if (error) {
                    reject(new ApiError(500, "Something went wrong while uploading"));
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(fileBuffer);
    });
};

export default handleCloudinaryUpload;
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate upload signature for secure frontend uploads
 * Frontend needs this to prove the upload is authorized
 */
export const generateUploadSignature = () => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp: timestamp,
            folder: 'bhavan-booking/rooms'
        },
        process.env.CLOUDINARY_API_SECRET
    );
    
    return { 
        timestamp, 
        signature 
    };
};

/**
 * Delete image from Cloudinary
 * Used when admin removes images or deletes rooms
 */
export const deleteImage = async (imageUrl) => {
    try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{extension}
        const urlParts = imageUrl.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
        const publicId = publicIdWithExtension.split('.')[0]; // folder/filename
        
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

export default cloudinary;
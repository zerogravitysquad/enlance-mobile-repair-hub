/**
 * Cloudinary Configuration
 * For persistent image storage (Render fs is ephemeral)
 */
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;

// Configure Cloudinary only if credentials exist
if (process.env.CLOUDINARY_API_KEY) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'enlance-repairs',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }]
        }
    });
    console.log("Using Cloudinary for image uploads.");
} else {
    // Fall back to memory storage (no disk writing needed, perfect for Render/Vercel)
    storage = multer.memoryStorage();
    console.log("Cloudinary credentials missing. Using memory storage fallback.");
}

const upload = multer({ storage });

module.exports = { cloudinary, upload };

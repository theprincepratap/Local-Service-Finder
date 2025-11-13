const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Local file path or buffer
 * @param {String} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise} - Upload result
 */
const uploadImage = async (filePath, folder = 'localworker', options = {}) => {
  try {
    const defaultOptions = {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' } // Auto format selection
      ]
    };

    const uploadOptions = { ...defaultOptions, ...options };
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Public ID of the image
 * @returns {Promise} - Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary deletion error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Upload document to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise} - Upload result
 */
const uploadDocument = async (filePath, folder = 'localworker/documents') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
    });
    
    console.log('✅ Document uploaded to Cloudinary:', result.secure_url);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format
    };
  } catch (error) {
    console.error('❌ Cloudinary document upload error:', error);
    throw new Error(`Failed to upload document to Cloudinary: ${error.message}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/cloud/image/upload/v123456/folder/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after version number
    const pathParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicIdWithExt = pathParts.join('/');
    
    // Remove file extension
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    console.error('❌ Error extracting public ID:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadDocument,
  getPublicIdFromUrl
};

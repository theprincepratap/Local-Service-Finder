const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');

/**
 * Upload image buffer to Cloudinary using stream
 * @param {Buffer} buffer - File buffer from multer
 * @param {String} folder - Cloudinary folder path
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} - Upload result with secure_url
 */
const uploadBufferToCloudinary = (buffer, folder = 'localworker', options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    const stream = streamifier.createReadStream(buffer);
    const cloudinaryStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return reject(error);
        }
        console.log('✅ Successfully uploaded to Cloudinary:', result.secure_url);
        resolve(result);
      }
    );

    stream.pipe(cloudinaryStream);
  });
};

/**
 * Upload profile image with optimized settings
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadProfileImage = async (buffer) => {
  const result = await uploadBufferToCloudinary(buffer, 'localworker/profiles', {
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });
  return result.secure_url;
};

/**
 * Upload document to Cloudinary
 * @param {Buffer} buffer - Document buffer
 * @param {String} docType - Document type (idProof, addressProof, certificate)
 * @returns {Promise<String>} - Cloudinary URL
 */
const uploadDocumentImage = async (buffer, docType = 'document') => {
  const result = await uploadBufferToCloudinary(buffer, `localworker/documents/${docType}`, {
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
  });
  return result.secure_url;
};

module.exports = {
  uploadBufferToCloudinary,
  uploadProfileImage,
  uploadDocumentImage
};

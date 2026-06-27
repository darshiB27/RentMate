import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';
import logger from './logger.js';

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary using a write-stream pipeline.
 * Ensures the application is stateless and leaves zero file residue on local disks.
 * @param {Buffer} fileBuffer - Input buffer from Multer memory storage.
 * @param {string} folder - Directory path inside Cloudinary bucket.
 * @returns {Promise<Object>} - Resolves with Cloudinary metadata response on success.
 */
export const uploadFromBuffer = (fileBuffer, folder = 'rentmate') => {
  // If credentials are placeholders or empty, bypass Cloudinary and return a mock result
  if (
    !env.CLOUDINARY_API_SECRET || 
    env.CLOUDINARY_API_SECRET === 'YOUR_CLOUDINARY_SECRET' ||
    env.CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUDINARY_CLOUD_NAME'
  ) {
    logger.warn('Cloudinary credentials not configured (using placeholder). Mocking upload with Unsplash room images.');
    const mockImages = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ];
    const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
    return Promise.resolve({
      secure_url: randomUrl,
      public_id: `mock_prop_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Auto-classify image, video, raw formats
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary direct stream upload failure:', error);
          
          // In development mode, fall back to mock images if upload fails
          if (env.NODE_ENV === 'development') {
            logger.warn('Cloudinary upload failed in development. Falling back to mock room images to prevent application error.');
            const mockImages = [
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
            ];
            const randomUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
            return resolve({
              secure_url: randomUrl,
              public_id: `mock_prop_${Math.random().toString(36).substr(2, 9)}`,
            });
          }
          
          return reject(error);
        }
        resolve(result);
      }
    );

    // Write buffer and finalize stream
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;

import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';

// Setup storage engine to keep files in memory buffers
const storage = multer.memoryStorage();

// File filter to restrict uploads to images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        STATUS_CODES.BAD_REQUEST,
        'File type rejected. Only image formats (JPEG, PNG, WEBP) are allowed.'
      ),
      false
    );
  }
};

// Configure Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size limit
  },
});

// Helper configurations
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10); // Enforce max 10 images

export default {
  upload,
  uploadSingle,
  uploadMultiple,
};

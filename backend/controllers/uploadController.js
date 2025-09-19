// controllers/uploadController.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

// Upload single file
const uploadSingle = upload.single('file');

// Upload multiple files
const uploadMultiple = upload.array('files', 10);

/* ------- UPLOAD COURSE THUMBNAIL ------- */
const uploadCourseThumbnail = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'courses/thumbnails',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: 'Upload failed',
              error: error.message
            });
          }

          res.json({
            success: true,
            message: 'Thumbnail uploaded successfully',
            data: {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes
            }
          });
        }
      ).end(req.file.buffer);
    });
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload thumbnail',
      error: error.message
    });
  }
};

/* ------- UPLOAD LESSON FILE ------- */
const uploadLessonFile = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { lessonType } = req.body;
      let folder = 'courses/lessons';
      let transformation = [];

      // Set folder and transformations based on file type
      if (lessonType === 'Video') {
        folder = 'courses/videos';
        transformation = [
          { quality: 'auto', format: 'mp4' }
        ];
      } else if (lessonType === 'PDF') {
        folder = 'courses/documents';
      } else {
        folder = 'courses/materials';
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          transformation: transformation
        },
        (error, result) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: 'Upload failed',
              error: error.message
            });
          }

          res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes,
              duration: result.duration || null
            }
          });
        }
      ).end(req.file.buffer);
    });
  } catch (error) {
    console.error('Upload lesson file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

/* ------- UPLOAD BATCH MATERIAL ------- */
const uploadBatchMaterial = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'batches/materials'
        },
        (error, result) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: 'Upload failed',
              error: error.message
            });
          }

          res.json({
            success: true,
            message: 'Material uploaded successfully',
            data: {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes
            }
          });
        }
      ).end(req.file.buffer);
    });
  } catch (error) {
    console.error('Upload batch material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload material',
      error: error.message
    });
  }
};

/* ------- DELETE FILE FROM CLOUDINARY ------- */
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

/* ------- GET UPLOAD SIGNATURE (for direct uploads) ------- */
const getUploadSignature = async (req, res) => {
  try {
    const { folder = 'courses/lessons' } = req.body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
      }
    });
  } catch (error) {
    console.error('Get upload signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
      error: error.message
    });
  }
};

module.exports = {
  uploadCourseThumbnail,
  uploadLessonFile,
  uploadBatchMaterial,
  deleteFile,
  getUploadSignature
};


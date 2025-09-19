// routes/uploadRoutes.js
const express = require('express');
const { userAuth } = require('../middleware/userAuth');
const {
  uploadCourseThumbnail,
  uploadLessonFile,
  uploadBatchMaterial,
  deleteFile,
  getUploadSignature
} = require('../controllers/uploadController');

const router = express.Router();

// Role-based middleware
const allowInstructor = (req, res, next) => {
  if (req.user.role === 'instructor' || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Instructors only.'
    });
  }
};

// Upload routes (all require authentication)
router.post('/course-thumbnail', userAuth, allowInstructor, uploadCourseThumbnail);
router.post('/lesson-file', userAuth, allowInstructor, uploadLessonFile);
router.post('/batch-material', userAuth, allowInstructor, uploadBatchMaterial);
router.delete('/file/:publicId', userAuth, allowInstructor, deleteFile);
router.post('/signature', userAuth, allowInstructor, getUploadSignature);

module.exports = router;


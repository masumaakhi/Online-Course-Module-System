// routes/batchRoutes.js
const express = require('express');
const { userAuth, isAdmin } = require('../middleware/userAuth');
const {
  validateCreateBatch,
  validateUpdateBatch,
  validateListBatches
} = require('../middleware/validation');
const {
  createBatch,
  listBatches,
  getBatch,
  updateBatch,
  removeBatch,
  addBatchMaterial,
  addBatchAnnouncement,
  getBatchEnrollments
} = require('../controllers/batchController');

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

// Public routes
router.get('/', validateListBatches, listBatches); // List batches (with filters)
router.get('/:id', getBatch); // Get single batch

// Instructor/Admin routes
router.post('/', userAuth, allowInstructor, validateCreateBatch, createBatch);
router.patch('/:id', userAuth, allowInstructor, validateUpdateBatch, updateBatch);
router.delete('/:id', userAuth, allowInstructor, removeBatch);

// Batch content management
router.post('/:id/materials', userAuth, allowInstructor, addBatchMaterial);
router.post('/:id/announcements', userAuth, allowInstructor, addBatchAnnouncement);

// Batch enrollment management
router.get('/:id/enrollments', userAuth, allowInstructor, getBatchEnrollments);

module.exports = router;


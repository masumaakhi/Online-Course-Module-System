// controllers/batchController.js
const batchModel = require('../models/batchModel');
const courseModel = require('../models/courseModel');
const enrollmentModel = require('../models/enrollmentModel');
const userModel = require('../models/userModel');

// Helper function to check batch ownership
const mustOwnBatch = async (batchId, user) => {
  const batch = await batchModel.findById(batchId);
  if (!batch) {
    const error = new Error('Batch not found');
    error.status = 404;
    throw error;
  }
  
  if (batch.mentor.toString() !== user._id.toString() && user.role !== 'admin') {
    const error = new Error('Forbidden: You can only modify your own batches');
    error.status = 403;
    throw error;
  }
  
  return batch;
};

/* ------- CREATE BATCH ------- */
const createBatch = async (req, res) => {
  try {
    const {
      course,
      name,
      description,
      startDate,
      endDate,
      seats,
      instructors = [],
      settings = {}
    } = req.body;

    // Validate required fields
    if (!course || !name || !startDate || !endDate || !seats) {
      return res.status(400).json({
        success: false,
        message: 'Course, name, start date, end date, and seats are required'
      });
    }

    // Check if course exists and user owns it
    const courseDoc = await courseModel.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only create batches for your own courses'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    const batch = await batchModel.create({
      course,
      name,
      description,
      startDate: start,
      endDate: end,
      seats,
      mentor: req.user._id,
      instructors,
      settings
    });

    await batch.populate('course', 'title category');
    await batch.populate('mentor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message
    });
  }
};

/* ------- LIST BATCHES ------- */
const listBatches = async (req, res) => {
  try {
    const { courseId, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (courseId) filter.course = courseId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const batches = await batchModel.find(filter)
      .populate('course', 'title category thumbnail')
      .populate('mentor', 'name email')
      .populate('instructors', 'name email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await batchModel.countDocuments(filter);

    res.json({
      success: true,
      data: batches,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('List batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
};

/* ------- GET SINGLE BATCH ------- */
const getBatch = async (req, res) => {
  try {
    const batch = await batchModel.findById(req.params.id)
      .populate('course')
      .populate('mentor', 'name email profilePicture')
      .populate('instructors', 'name email profilePicture');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch',
      error: error.message
    });
  }
};

/* ------- UPDATE BATCH ------- */
const updateBatch = async (req, res) => {
  try {
    const batch = await mustOwnBatch(req.params.id, req.user);
    
    const {
      name,
      description,
      startDate,
      endDate,
      seats,
      instructors,
      settings,
      status
    } = req.body;

    if (name !== undefined) batch.name = name;
    if (description !== undefined) batch.description = description;
    if (startDate !== undefined) batch.startDate = new Date(startDate);
    if (endDate !== undefined) batch.endDate = new Date(endDate);
    if (seats !== undefined) batch.seats = seats;
    if (instructors !== undefined) batch.instructors = instructors;
    if (settings !== undefined) batch.settings = { ...batch.settings, ...settings };
    if (status !== undefined) batch.status = status;

    await batch.save();

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to update batch',
      error: error.message
    });
  }
};

/* ------- DELETE BATCH ------- */
const removeBatch = async (req, res) => {
  try {
    const batch = await mustOwnBatch(req.params.id, req.user);
    
    // Delete all enrollments for this batch
    await enrollmentModel.deleteMany({ batch: batch._id });
    
    // Delete the batch
    await batch.deleteOne();

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Remove batch error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to delete batch',
      error: error.message
    });
  }
};

/* ------- ADD BATCH MATERIAL ------- */
const addBatchMaterial = async (req, res) => {
  try {
    const batch = await mustOwnBatch(req.params.id, req.user);
    
    const { title, description, fileUrl, type } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title and file URL are required'
      });
    }

    const material = {
      title,
      description: description || '',
      fileUrl,
      type: type || 'document',
      uploadedBy: req.user._id
    };

    batch.materials.push(material);
    await batch.save();

    res.status(201).json({
      success: true,
      message: 'Material added successfully',
      data: batch.materials[batch.materials.length - 1]
    });
  } catch (error) {
    console.error('Add batch material error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to add material',
      error: error.message
    });
  }
};

/* ------- ADD BATCH ANNOUNCEMENT ------- */
const addBatchAnnouncement = async (req, res) => {
  try {
    const batch = await mustOwnBatch(req.params.id, req.user);
    
    const { title, content, priority = 'medium' } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const announcement = {
      title,
      content,
      priority,
      createdBy: req.user._id
    };

    batch.announcements.push(announcement);
    await batch.save();

    res.status(201).json({
      success: true,
      message: 'Announcement added successfully',
      data: batch.announcements[batch.announcements.length - 1]
    });
  } catch (error) {
    console.error('Add batch announcement error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to add announcement',
      error: error.message
    });
  }
};

/* ------- GET BATCH ENROLLMENTS ------- */
const getBatchEnrollments = async (req, res) => {
  try {
    const batch = await mustOwnBatch(req.params.id, req.user);
    
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = { batch: batch._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const enrollments = await enrollmentModel.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await enrollmentModel.countDocuments(filter);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get batch enrollments error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch batch enrollments',
      error: error.message
    });
  }
};

module.exports = {
  createBatch,
  listBatches,
  getBatch,
  updateBatch,
  removeBatch,
  addBatchMaterial,
  addBatchAnnouncement,
  getBatchEnrollments
};


// controllers/enrollmentController.js
const enrollmentModel = require('../models/enrollmentModel');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');

/* ------- STUDENT SELF-ENROLL (Open Enrollment) ------- */
const enrollOpen = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.enrollmentType !== 'open' || course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is not open for enrollment'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await enrollmentModel.findOne({
      course: courseId,
      student: req.user._id
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await enrollmentModel.create({
      course: courseId,
      student: req.user._id,
      status: 'active',
      progress: {
        completedLessonIds: [],
        percentage: 0,
        timeSpent: 0
      }
    });

    // Update course enrollment count
    await courseModel.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    // Populate course details
    await enrollment.populate('course', 'title category pricing thumbnail');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll open error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
};

/* ------- CORPORATE ADMIN ASSIGNS EMPLOYEES (Assigned Enrollment) ------- */
const assignEmployees = async (req, res) => {
  try {
    const { courseId, employeeIds = [] } = req.body;
    
    if (!courseId || !employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and employee IDs are required'
      });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.enrollmentType !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Course must be of assigned enrollment type'
      });
    }

    // Check if user has permission to assign
    if (req.user.role !== 'corporateAdmin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only corporate admins can assign courses to employees'
      });
    }

    const results = [];
    const errors = [];

    for (const employeeId of employeeIds) {
      try {
        // Check if employee exists
        const employee = await userModel.findById(employeeId);
        if (!employee) {
          errors.push(`Employee with ID ${employeeId} not found`);
          continue;
        }

        // Check if already enrolled
        const existingEnrollment = await enrollmentModel.findOne({
          course: courseId,
          student: employeeId
        });

        if (existingEnrollment) {
          errors.push(`Employee ${employee.name} is already enrolled in this course`);
          continue;
        }

        // Create enrollment
        const enrollment = await enrollmentModel.create({
          course: courseId,
          student: employeeId,
          assignedBy: req.user._id,
          status: 'active',
          progress: {
            completedLessonIds: [],
            percentage: 0,
            timeSpent: 0
          }
        });

        await enrollment.populate('student', 'name email');
        results.push(enrollment);
      } catch (error) {
        errors.push(`Failed to enroll employee ${employeeId}: ${error.message}`);
      }
    }

    // Update course enrollment count
    if (results.length > 0) {
      await courseModel.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: results.length }
      });
    }

    res.json({
      success: true,
      message: `Successfully enrolled ${results.length} employees`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Assign employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employees to course',
      error: error.message
    });
  }
};

/* ------- GET MY ENROLLMENTS ------- */
const myEnrollments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { student: req.user._id };
    if (status) {
      const list = String(status).split(',').map(s => s.trim()).filter(Boolean);
      filter.status = list.length > 1 ? { $in: list } : list[0];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const enrollments = await enrollmentModel.find(filter)
      .populate('course', 'title category pricing thumbnail status totalDuration difficulty')
      // .populate('owner', 'name email')
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
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
};

/* ------- GET ENROLLMENT DETAILS ------- */
const getEnrollment = async (req, res) => {
  try {
    const enrollment = await enrollmentModel.findById(req.params.id)
      .populate('course')
      .populate('student', 'name email')
      .populate('assignedBy', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user can access this enrollment
    if (enrollment.student._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'corporateAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment',
      error: error.message
    });
  }
};

/* ------- UPDATE PROGRESS (FR12) ------- */
const markLessonComplete = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { lessonId, timeSpent = 0 } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    const enrollment = await enrollmentModel.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update progress
    await enrollment.updateProgress(lessonId, enrollment.course);

    // Update time spent
    enrollment.progress.timeSpent += timeSpent;

    // Update last accessed lesson
    enrollment.progress.lastAccessedLesson = lessonId;

    await enrollment.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment.progress
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/* ------- UPDATE ENROLLMENT STATUS ------- */
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status, notes } = req.body;

    const enrollment = await enrollmentModel.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check permissions
    const canUpdate = enrollment.student.toString() === req.user._id.toString() ||
                     req.user.role === 'admin' ||
                     req.user.role === 'corporateAdmin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (status) enrollment.status = status;
    if (notes !== undefined) enrollment.notes = notes;

    if (status === 'completed') {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status',
      error: error.message
    });
  }
};

/* ------- GET COURSE ENROLLMENTS (For Instructors/Admins) ------- */
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    // Check if user can view enrollments for this course
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const canView = course.owner.toString() === req.user._id.toString() ||
                   req.user.role === 'admin' ||
                   req.user.role === 'corporateAdmin';

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filter = { course: courseId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const enrollments = await enrollmentModel.find(filter)
      .populate('student', 'name email')
      .populate('assignedBy', 'name email')
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
    console.error('Get course enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course enrollments',
      error: error.message
    });
  }
};

/* ------- ADD RATING AND REVIEW ------- */
const addRatingReview = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const enrollment = await enrollmentModel.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update rating and review
    enrollment.rating = rating;
    enrollment.review = review || '';

    await enrollment.save();

    // Update course average rating
    const courseEnrollments = await enrollmentModel.find({
      course: enrollment.course._id,
      rating: { $exists: true, $ne: null }
    });

    const totalRating = courseEnrollments.reduce((sum, enr) => sum + enr.rating, 0);
    const averageRating = totalRating / courseEnrollments.length;

    await courseModel.findByIdAndUpdate(enrollment.course._id, {
      'rating.average': averageRating,
      'rating.count': courseEnrollments.length
    });

    res.json({
      success: true,
      message: 'Rating and review added successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Add rating review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating and review',
      error: error.message
    });
  }
};

/* ------- UNENROLL FROM COURSE ------- */
const unenrollFromCourse = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await enrollmentModel.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update enrollment status
    enrollment.status = 'cancelled';
    await enrollment.save();

    // Decrease course enrollment count
    await courseModel.findByIdAndUpdate(enrollment.course._id, {
      $inc: { enrollmentCount: -1 }
    });

    res.json({
      success: true,
      message: 'Successfully unenrolled from course',
      data: enrollment
    });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll from course',
      error: error.message
    });
  }
};

/* ------- GET MY ENROLLMENT BY COURSE (helper for FE) ------- */
const getMyEnrollmentByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await enrollmentModel.findOne({
      course: courseId,
      student: req.user._id,
      status: { $in: ['active', 'completed']}
    })
    .populate({
      path: 'course',
      select: 'title category pricing thumbnail status totalDuration difficulty owner modules visibility enrollmentType',
      populate: { path: 'owner', select: 'name email' }
    })
    .lean();

    // না থাকলে null ফেরত দেবো, ফ্রন্টএন্ড বুঝে নেবে যে এখনো enroll করা হয়নি
    return res.json({
      success: true,
      data: enrollment || null
    });
  } catch (error) {
    console.error('getMyEnrollmentByCourse error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch my enrollment for this course',
      error: error.message
    });
  }
};


module.exports = {
  enrollOpen,
  assignEmployees,
  myEnrollments,
  getEnrollment,
  markLessonComplete,
  updateEnrollmentStatus,
  getCourseEnrollments,
  addRatingReview,
  unenrollFromCourse,
  getMyEnrollmentByCourse,
};


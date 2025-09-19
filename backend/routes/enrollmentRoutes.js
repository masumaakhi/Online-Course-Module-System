// routes/enrollmentRoutes.js
const express = require('express');
const { userAuth } = require('../middleware/userAuth');
const {
  validateEnrollOpen,
  validateAssignEmployees,
  validateProgressUpdate,
  validateRatingReview
} = require('../middleware/validation');
const {
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
} = require('../controllers/enrollmentController');

const router = express.Router();

const allowStudent = (req, res, next) => {
  if (['student', 'instructor', 'corporateAdmin', 'admin'].includes(req.user.role)) return next();
  return res.status(403).json({ success:false, message:'Access denied. Students only.' });
};
const allowCorporateAdmin = (req, res, next) => {
  if (req.user.role === 'corporateAdmin' || req.user.role === 'admin') return next();
  return res.status(403).json({ success:false, message:'Access denied. Corporate admins only.' });
};
const allowInstructor = (req, res, next) => {
  if (req.user.role === 'instructor' || req.user.role === 'admin') return next();
  return res.status(403).json({ success:false, message:'Access denied. Instructors only.' });
};

// Enrollment
router.post('/open',   userAuth, allowStudent,        validateEnrollOpen,   enrollOpen);
router.post('/assign', userAuth, allowCorporateAdmin, validateAssignEmployees, assignEmployees);

// Student
router.get('/mine', userAuth, allowStudent, myEnrollments);

// ✅ Put these BEFORE `/:id` to be extra safe
router.get('/by-course/:courseId', userAuth, allowStudent,   getMyEnrollmentByCourse);
router.get('/course/:courseId',    userAuth, allowInstructor, getCourseEnrollments);

router.get('/:id', userAuth, getEnrollment);
router.post('/:enrollmentId/progress', userAuth, allowStudent, validateProgressUpdate, markLessonComplete);
router.put('/:enrollmentId/status',    userAuth, updateEnrollmentStatus);
router.post('/:enrollmentId/rating',   userAuth, allowStudent, validateRatingReview, addRatingReview);
router.delete('/:enrollmentId',        userAuth, allowStudent, unenrollFromCourse);

module.exports = router;

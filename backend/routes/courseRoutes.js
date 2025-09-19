// routes/courseRoutes.js
const express = require('express');
const { userAuth } = require('../middleware/userAuth');
const {
  validateCreateCourse,
  validateUpdateCourse,
  validateModule,
  validateLesson,
  validatePricingVisibility,
  validateListCourses
} = require('../middleware/validation');
const {
  createCourse,
  getCourse,
  listCourses,
  updateCourseBasic,
  addModule,
  updateModule,
  removeModule,
  addLesson,
  updateLesson,
  removeLesson,
  setPricingVisibility,
  saveDraft,
  publishCourse,
  removeCourse,
  getInstructorCourses,
  getCourseStats
} = require('../controllers/courseController');

const router = express.Router();

/* ---------- Role guards (null-safe) ---------- */
const allowInstructor = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'instructor' || role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied. Instructors only.' });
};

const allowCorporateAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'corporateAdmin' || role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied. Corporate admins only.' });
};

/* ---------- Instructor dashboards/statistics ---------- */
router.get('/instructor/my-courses', userAuth, allowInstructor, getInstructorCourses);
router.get('/:id/stats', userAuth, allowInstructor, getCourseStats);

/* ---------- Public listing & details ---------- */
router.get('/', validateListCourses, listCourses);
// Published public course anyone can view; other cases checked in controller
router.get('/:id', getCourse);

/* ---------- Instructor/Admin authoring ---------- */
router.post('/', userAuth, allowInstructor, validateCreateCourse, createCourse);
router.put('/:id', userAuth, allowInstructor, validateUpdateCourse, updateCourseBasic);
router.delete('/:id', userAuth, allowInstructor, removeCourse);

/* ---------- Settings ---------- */
router.post('/:id/settings', userAuth, allowInstructor, validatePricingVisibility, setPricingVisibility);

/* ---------- Publish workflow ---------- */
router.post('/:id/draft', userAuth, allowInstructor, saveDraft);
router.post('/:id/publish', userAuth, allowInstructor, publishCourse);

/* ---------- Modules ---------- */
router.post('/:id/modules', userAuth, allowInstructor, validateModule, addModule);
router.put('/:id/modules/:moduleId', userAuth, allowInstructor, validateModule, updateModule);
router.delete('/:id/modules/:moduleId', userAuth, allowInstructor, removeModule);

/* ---------- Lessons ---------- */
router.post('/:id/modules/:moduleId/lessons', userAuth, allowInstructor, validateLesson, addLesson);
router.put('/:id/modules/:moduleId/lessons/:lessonId', userAuth, allowInstructor, validateLesson, updateLesson);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', userAuth, allowInstructor, removeLesson);

module.exports = router;

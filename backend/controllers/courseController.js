// controllers/courseController.js
const courseModel = require('../models/courseModel');
const enrollmentModel = require('../models/enrollmentModel');

/* ---------- helpers ---------- */
const mustOwnCourse = async (courseId, user) => {
  const course = await courseModel.findById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.status = 404;
    throw error;
  }
  if (String(course.owner) !== String(user._id) && user.role !== 'admin') {
    const error = new Error('Forbidden: You can only modify your own courses');
    error.status = 403;
    throw error;
  }
  return course;
};

// public+published সবাই দেখতে পারবে; অন্য কেসে user লাগবে
const canAccessCourse = (course, user) => {
  if (course.visibility === 'public' && course.status === 'published') return true;
  if (!user) return false;
  if (String(course.owner) === String(user._id)) return true;
  if (user.role === 'admin') return true;
  // private হলে রুট হ্যান্ডলার এনরোলমেন্ট চেক করবে
  return false;
};

/* ---------- CREATE ---------- */
const createCourse = async (req, res) => {
  try {
    const {
      title, description, category, tags = [],
      audience = 'general', difficulty = 'Beginner', language = 'English',
      prerequisites = [], objectives = [], thumbnail
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }

    const course = await courseModel.create({
      title, description, category, tags, audience, difficulty, language,
      prerequisites, objectives, thumbnail,
      owner: req.user._id, status: 'draft'
    });

    return res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
};

/* ---------- GET ONE (public aware) ---------- */
const getCourse = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .lean();

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // 1) Published + Public => anyone
    if (canAccessCourse(course, req.user)) {
      return res.json({ success: true, data: course });
    }

    // 2) Need auth from here
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Login required' });
    }

    // 3) Private => check enrollment
    if (course.visibility === 'private') {
      const enrollment = await enrollmentModel.findOne({
        course: course._id,
        student: req.user._id,
        status: { $in: ['active', 'completed'] }
      }).lean();

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not enrolled in this private course'
        });
      }
      return res.json({ success: true, data: course });
    }

    // 4) Not published public (e.g., draft) but not owner/admin -> deny
    return res.status(403).json({ success: false, message: 'Access denied' });
  } catch (error) {
    console.error('Get course error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
};

/* ---------- LIST ---------- */
const listCourses = async (req, res) => {
  try {
    const {
      q, category, tags, plan, audience, difficulty,
      status = 'published', page = 1, limit = 12,
      sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    const filter = { status, visibility: 'public' };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (audience) filter.audience = audience;
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: String(tags).split(',') };
    if (plan) filter['pricing.plan'] = plan;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      courseModel.find(filter)
        .populate('owner', 'name email profilePicture')
        .sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      courseModel.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('List courses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

/* ---------- UPDATE BASIC ---------- */
const updateCourseBasic = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const {
      title, description, category, tags, audience, difficulty,
      language, prerequisites, objectives, thumbnail
    } = req.body;

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (tags !== undefined) course.tags = tags;
    if (audience !== undefined) course.audience = audience;
    if (difficulty !== undefined) course.difficulty = difficulty;
    if (language !== undefined) course.language = language;
    if (prerequisites !== undefined) course.prerequisites = prerequisites;
    if (objectives !== undefined) course.objectives = objectives;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;

    await course.save();
    return res.json({ success: true, message: 'Course updated successfully', data: course });
  } catch (error) {
    console.error('Update course error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update course', error: error.message });
  }
};

/* ---------- MODULES ---------- */
const addModule = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const { name, description = '' } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Module name is required' });

    const newModule = { name, description, lessons: [], order: course.modules.length };
    course.modules.push(newModule);
    await course.save();

    const created = course.modules[course.modules.length - 1];
    return res.status(201).json({ success: true, message: 'Module added successfully', data: created });
  } catch (error) {
    console.error('Add module error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to add module', error: error.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const module = course.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    const { name, description, order } = req.body;
    if (name !== undefined) module.name = name;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;

    await course.save();
    return res.json({ success: true, message: 'Module updated successfully', data: module });
  } catch (error) {
    console.error('Update module error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update module', error: error.message });
  }
};

const removeModule = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const module = course.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    module.remove();
    await course.save();
    return res.json({ success: true, message: 'Module removed successfully' });
  } catch (error) {
    console.error('Remove module error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to remove module', error: error.message });
  }
};

/* ---------- LESSONS ---------- */
const addLesson = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const module = course.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    const { title, type = 'Video', duration = '0:00', fileUrl = '', link = '', description = '' } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Lesson title is required' });

    const newLesson = { title, type, duration, fileUrl, link, description, order: module.lessons.length };
    module.lessons.push(newLesson);
    await course.save();

    const created = module.lessons[module.lessons.length - 1];
    return res.status(201).json({ success: true, message: 'Lesson added successfully', data: created });
  } catch (error) {
    console.error('Add lesson error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to add lesson', error: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const module = course.modules.id(req.params.moduleId);
    const lesson = module?.lessons.id(req.params.lessonId);
    if (!module || !lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const { title, type, duration, fileUrl, link, description, order } = req.body;
    if (title !== undefined) lesson.title = title;
    if (type !== undefined) lesson.type = type;
    if (duration !== undefined) lesson.duration = duration;
    if (fileUrl !== undefined) lesson.fileUrl = fileUrl;
    if (link !== undefined) lesson.link = link;
    if (description !== undefined) lesson.description = description;
    if (order !== undefined) lesson.order = order;

    await course.save();
    return res.json({ success: true, message: 'Lesson updated successfully', data: lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update lesson', error: error.message });
  }
};

const removeLesson = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const module = course.modules.id(req.params.moduleId);
    const lesson = module?.lessons.id(req.params.lessonId);
    if (!module || !lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    lesson.remove();
    await course.save();
    return res.json({ success: true, message: 'Lesson removed successfully' });
  } catch (error) {
    console.error('Remove lesson error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to remove lesson', error: error.message });
  }
};

/* ---------- SETTINGS ---------- */
const setPricingVisibility = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    const { visibility, pricing, enrollmentType } = req.body;

    if (visibility) course.visibility = visibility;
    if (pricing) {
      course.pricing.plan = pricing.plan ?? course.pricing.plan;
      course.pricing.price = pricing.price ?? course.pricing.price;
      course.pricing.discount = pricing.discount ?? course.pricing.discount;
    }
    if (enrollmentType) course.enrollmentType = enrollmentType;

    await course.save();
    return res.json({ success: true, message: 'Course settings updated successfully', data: course });
  } catch (error) {
    console.error('Set pricing visibility error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update course settings', error: error.message });
  }
};

/* ---------- PUBLISH ---------- */
const saveDraft = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    course.status = 'draft';
    await course.save();
    return res.json({ success: true, message: 'Course saved as draft', data: course });
  } catch (error) {
    console.error('Save draft error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to save draft', error: error.message });
  }
};

const publishCourse = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    if (!course.title || !course.description || course.modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course must have title, description, and at least one module to publish'
      });
    }
    course.status = 'published';
    await course.save();
    return res.json({ success: true, message: 'Course published successfully', data: course });
  } catch (error) {
    console.error('Publish course error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to publish course', error: error.message });
  }
};

/* ---------- DELETE ---------- */
const removeCourse = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);
    await enrollmentModel.deleteMany({ course: course._id });
    await course.deleteOne();
    return res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Remove course error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to delete course', error: error.message });
  }
};

/* ---------- Instructor courses & stats ---------- */
const getInstructorCourses = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [courses, total] = await Promise.all([
      courseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      courseModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: courses,
      pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total, limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

const getCourseStats = async (req, res) => {
  try {
    const course = await mustOwnCourse(req.params.id, req.user);

    const [enrollmentCount, completedCount, recentEnrollments] = await Promise.all([
      enrollmentModel.countDocuments({ course: course._id, status: { $in: ['active', 'completed'] } }),
      enrollmentModel.countDocuments({ course: course._id, status: 'completed' }),
      enrollmentModel.find({ course: course._id }).populate('student', 'name email').sort({ createdAt: -1 }).limit(10).lean()
    ]);

    return res.json({
      success: true,
      data: {
        enrollmentCount,
        completedCount,
        completionRate: enrollmentCount > 0 ? Number(((completedCount / enrollmentCount) * 100).toFixed(2)) : 0,
        recentEnrollments
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to fetch course statistics', error: error.message });
  }
};

module.exports = {
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
};

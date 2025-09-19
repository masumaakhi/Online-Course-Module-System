// middleware/validation.js
const { body, param, query, validationResult } = require("express-validator");

/* ------------ helpers ------------- */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// commonly used option: treat "", null, undefined as "missing"
const OPT = { nullable: true, checkFalsy: true };

/* ------------ Course: create / update ------------- */
const validCategories = [
  "Web Development",
  "AI/ML",
  "Data Science",
  "UI/UX",
  "Mobile Development",
  "DevOps",
  "Cybersecurity",
  "Database",
  "Other",
];
const validDifficulties = ["Beginner", "Intermediate", "Advanced"];

const validateCreateCourse = [
  body("title").trim().isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description").trim().isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("category").isIn(validCategories).withMessage("Invalid category"),

  body("tags").optional(OPT).isArray().withMessage("Tags must be an array"),
  body("tags.*").optional(OPT).trim().isLength({ min: 1, max: 50 })
    .withMessage("Each tag must be between 1 and 50 characters"),

  body("audience").optional(OPT).isIn(["general", "corporate"])
    .withMessage("Invalid audience type"),
  body("difficulty").optional(OPT).isIn(validDifficulties)
    .withMessage("Invalid difficulty level"),
  body("language").optional(OPT).trim().isLength({ min: 2, max: 50 })
    .withMessage("Language must be between 2 and 50 characters"),

  body("prerequisites").optional(OPT).isArray()
    .withMessage("Prerequisites must be an array"),
  body("prerequisites.*").optional(OPT).trim().isLength({ min: 1, max: 200 })
    .withMessage("Each prerequisite must be between 1 and 200 characters"),

  body("objectives").optional(OPT).isArray()
    .withMessage("Objectives must be an array"),
  body("objectives.*").optional(OPT).trim().isLength({ min: 1, max: 200 })
    .withMessage("Each objective must be between 1 and 200 characters"),

  // allow thumbnail if you send it
  body("thumbnail").optional(OPT).isURL({ require_protocol: true })
    .withMessage("Thumbnail must be a valid URL"),

  handleValidationErrors,
];

const validateUpdateCourse = [
  param("id").isMongoId().withMessage("Invalid course ID"),

  body("title").optional(OPT).trim().isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description").optional(OPT).trim().isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("category").optional(OPT).isIn(validCategories)
    .withMessage("Invalid category"),

  handleValidationErrors,
];

/* ------------ Module / Lesson ------------- */
// ➤ Module: only name is required. Description OPTIONAL (empty allowed)
const validateModule = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  body("name").trim().isLength({ min: 1, max: 200 })
    .withMessage("Module name must be between 1 and 200 characters"),
  body("description").optional(OPT).trim().isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  handleValidationErrors,
];

// ➤ Lesson: only title required; others OPTIONAL
const validateLesson = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  param("moduleId").isMongoId().withMessage("Invalid module ID"),

  body("title").trim().isLength({ min: 1, max: 200 })
    .withMessage("Lesson title must be between 1 and 200 characters"),
  body("type").optional(OPT).isIn(["Video", "PDF", "Quiz", "Assignment"])
    .withMessage("Invalid lesson type"),
  body("duration").optional(OPT)
    .matches(/^([0-5]?\d):([0-5]\d)$/) // 0–59:00..59
    .withMessage("Duration must be in format MM:SS"),
  body("description").optional(OPT).trim().isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("fileUrl").optional(OPT).isURL({ require_protocol: true, allow_underscores: true })
    .withMessage("File URL must be a valid URL"),
  body("link").optional(OPT).isURL({ require_protocol: true, allow_underscores: true })
    .withMessage("External link must be a valid URL"),

  handleValidationErrors,
];

/* ------------ Pricing / Visibility ------------- */
const validatePricingVisibility = [
  param("id").isMongoId().withMessage("Invalid course ID"),

  body("visibility").optional(OPT).isIn(["public", "private"])
    .withMessage("Invalid visibility setting"),
  body("pricing.plan").optional(OPT).isIn(["free", "paid"])
    .withMessage("Invalid pricing plan"),
  body("pricing.price").optional(OPT).isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("pricing.discount").optional(OPT).isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("enrollmentType").optional(OPT).isIn(["open", "assigned"])
    .withMessage("Invalid enrollment type"),

  handleValidationErrors,
];

/* ------------ Enrollment ------------- */
const validateEnrollOpen = [
  body("courseId").isMongoId().withMessage("Invalid course ID"),
  handleValidationErrors,
];

const validateAssignEmployees = [
  body("courseId").isMongoId().withMessage("Invalid course ID"),
  body("employeeIds").isArray({ min: 1 })
    .withMessage("Employee IDs must be an array with at least one ID"),
  body("employeeIds.*").isMongoId().withMessage("Each employee ID must be valid"),
  handleValidationErrors,
];

const validateProgressUpdate = [
  param("enrollmentId").isMongoId().withMessage("Invalid enrollment ID"),
  body("lessonId").isMongoId().withMessage("Invalid lesson ID"),
  body("timeSpent").optional(OPT).isFloat({ min: 0 })
    .withMessage("Time spent must be a positive number"),
  handleValidationErrors,
];

const validateRatingReview = [
  param("enrollmentId").isMongoId().withMessage("Invalid enrollment ID"),
  body("rating").isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("review").optional(OPT).trim().isLength({ max: 1000 })
    .withMessage("Review must be less than 1000 characters"),
  handleValidationErrors,
];

/* ------------ Batch ------------- */
const validateCreateBatch = [
  body("course").isMongoId().withMessage("Invalid course ID"),
  body("name").trim().isLength({ min: 1, max: 200 })
    .withMessage("Batch name must be between 1 and 200 characters"),
  body("description").optional(OPT).trim().isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("endDate").isISO8601().withMessage("End date must be a valid date"),
  body("seats").isInt({ min: 1 }).withMessage("Seats must be a positive integer"),
  body("instructors").optional(OPT).isArray().withMessage("Instructors must be an array"),
  body("instructors.*").optional(OPT).isMongoId().withMessage("Each instructor ID must be valid"),
  handleValidationErrors,
];

const validateUpdateBatch = [
  param("id").isMongoId().withMessage("Invalid batch ID"),
  body("name").optional(OPT).trim().isLength({ min: 1, max: 200 })
    .withMessage("Batch name must be between 1 and 200 characters"),
  body("startDate").optional(OPT).isISO8601().withMessage("Start date must be a valid date"),
  body("endDate").optional(OPT).isISO8601().withMessage("End date must be a valid date"),
  body("seats").optional(OPT).isInt({ min: 1 }).withMessage("Seats must be a positive integer"),
  handleValidationErrors,
];

/* ------------ Queries ------------- */
const validateListCourses = [
  query("page").optional(OPT).isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional(OPT).isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("category").optional(OPT).isIn(validCategories).withMessage("Invalid category"),
  query("difficulty").optional(OPT).isIn(validDifficulties).withMessage("Invalid difficulty level"),
  query("plan").optional(OPT).isIn(["free", "paid"]).withMessage("Invalid pricing plan"),
  query("audience").optional(OPT).isIn(["general", "corporate"]).withMessage("Invalid audience type"),
  // allow sort like "-createdAt" / "createdAt"
  query("sort").optional(OPT).matches(/^(-)?[a-zA-Z0-9_]+$/).withMessage("Invalid sort field"),
  handleValidationErrors,
];

const validateListBatches = [
  query("courseId").optional(OPT).isMongoId().withMessage("Invalid course ID"),
  query("status").optional(OPT).isIn(["upcoming", "active", "completed", "cancelled"])
    .withMessage("Invalid batch status"),
  query("page").optional(OPT).isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional(OPT).isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

module.exports = {
  validateCreateCourse,
  validateUpdateCourse,
  validateModule,
  validateLesson,
  validatePricingVisibility,
  validateEnrollOpen,
  validateAssignEmployees,
  validateProgressUpdate,
  validateRatingReview,
  validateCreateBatch,
  validateUpdateBatch,
  validateListCourses,
  validateListBatches,
  handleValidationErrors,
};

// models/enrollmentModel.js
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    completedLessonIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    lastAccessedModule: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    timeSpent: {
      type: Number,
      default: 0, // minutes
    },
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { _id: false }
);

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }, // corporateAdmin who assigned the course

    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "paused"],
      default: "active",
    },

    progress: {
      type: progressSchema,
      default: () => ({}),
    },

    // Enrollment metadata
    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Payment (optional)
    payment: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      paymentMethod: { type: String, default: "" },
      transactionId: { type: String, default: "" },
      paidAt: { type: Date, default: null },
    },

    // Certificate (optional)
    certificate: {
      issued: { type: Boolean, default: false },
      issuedAt: { type: Date, default: null },
      certificateId: { type: String, default: "" },
    },

    // Notes & feedback
    notes: { type: String, default: "" },

    // Student rating/review
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: "" },
  },
  { timestamps: true }
);

// Unique enrollment per (course, student)
enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

// Helpful indexes
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ assignedBy: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Virtual completion flag
enrollmentSchema.virtual("isCompleted").get(function () {
  return this.status === "completed" || this.progress.percentage === 100;
});

/**
 * Safely update progress (fix for ObjectId vs string mismatch)
 * @param {ObjectId|String} lessonId
 * @param {Course} course (must have modules[].lessons[])
 */
enrollmentSchema.methods.updateProgress = function (lessonId, course) {
  const idStr = lessonId.toString();
  const alreadyDone = this.progress.completedLessonIds.some(
    (id) => id.toString() === idStr
  );

  if (!alreadyDone) {
    this.progress.completedLessonIds.push(lessonId);

    // total lessons in course
    const totalLessons = (course.modules || []).reduce(
      (acc, m) => acc + (m.lessons?.length || 0),
      0
    );

    if (totalLessons > 0) {
      this.progress.percentage = Math.min(
        100,
        Math.round(
          (this.progress.completedLessonIds.length / totalLessons) * 100
        )
      );
    }

    // auto-complete enrollment
    if (this.progress.percentage === 100 && this.status === "active") {
      this.status = "completed";
      this.completedAt = new Date();
    }
  }

  return this.save();
};

// Summarized progress (handy for UI)
enrollmentSchema.methods.getProgressSummary = function (course) {
  const totalLessons = (course.modules || []).reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );
  const completedLessons = this.progress.completedLessonIds.length;

  return {
    totalLessons,
    completedLessons,
    percentage: this.progress.percentage,
    isCompleted: this.isCompleted,
    timeSpent: this.progress.timeSpent,
  };
};

const enrollmentModel =
  mongoose.models.enrollment || mongoose.model("enrollment", enrollmentSchema);

module.exports = enrollmentModel;

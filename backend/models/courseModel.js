// models/courseModel.js
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['Video', 'PDF', 'Quiz', 'Assignment'], 
    default: 'Video' 
  },
  duration: { 
    type: String, 
    default: "0:00"
  },
  fileUrl: { 
    type: String, 
    default: ""
  },
  link: { 
    type: String, 
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },   // ✅ only this required
  description: { type: String, default: "" },           // ✅ optional
  lessons: [lessonSchema],
  order: { 
    type: Number, 
    default: 0 
  },
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    default: '' 
  },
  category: { 
    type: String, 
    required: true,
    index: true,
    enum: ['Web Development', 'AI/ML', 'Data Science', 'UI/UX', 'Mobile Development', 'DevOps', 'Cybersecurity', 'Database', 'Other']
  },
  tags: [{ 
    type: String, 
    index: true,
    trim: true
  }],

  // Course audience and visibility
  audience: { 
    type: String, 
    enum: ['general', 'corporate'], 
    default: 'general' 
  },
  visibility: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'public' 
  },

  // Pricing configuration
  pricing: {
    plan: { 
      type: String, 
      enum: ['free', 'paid'], 
      default: 'free' 
    },
    price: { 
      type: Number, 
      default: 0,
      min: 0
    },
    discount: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100
    },
  },

  // Enrollment settings
  enrollmentType: { 
    type: String, 
    enum: ['open', 'assigned'], 
    default: 'open' 
  },

  // Course owner (instructor)
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },

  // Course content
  modules: [moduleSchema],

  // Course status
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },

  // Course metadata
  thumbnail: {
    type: String,
    default: ""
  },
  
  // Enrollment statistics
  enrollmentCount: {
    type: Number,
    default: 0
  },

  // Course duration (calculated from lessons)
  totalDuration: {
    type: String,
    default: "0:00"
  },

  // Course difficulty level
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },

  // Course language
  language: {
    type: String,
    default: 'English'
  },

  // Prerequisites
  prerequisites: [{
    type: String,
    trim: true
  }],

  // Learning objectives
  objectives: [{
    type: String,
    trim: true
  }],

  // Course rating and reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }

}, { 
  timestamps: true 
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ owner: 1, status: 1 });
courseSchema.index({ 'pricing.plan': 1, status: 1 });

// Virtual for total lessons count
courseSchema.virtual('totalLessons').get(function() {
  return this.modules.reduce((total, module) => total + module.lessons.length, 0);
});

// Method to calculate total duration
courseSchema.methods.calculateTotalDuration = function() {
  let totalMinutes = 0;
  
  this.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.duration && lesson.type === 'Video') {
        const [minutes, seconds] = lesson.duration.split(':').map(Number);
        totalMinutes += minutes + (seconds / 60);
      }
    });
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

// Pre-save middleware to update total duration
courseSchema.pre('save', function(next) {
  this.totalDuration = this.calculateTotalDuration();
  next();
});

const courseModel = mongoose.models.course || mongoose.model("course", courseSchema);

module.exports = courseModel;


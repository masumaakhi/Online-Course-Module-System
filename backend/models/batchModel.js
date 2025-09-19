// models/batchModel.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'course', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  
  // Batch timing
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  
  // Batch capacity
  seats: { 
    type: Number, 
    required: true,
    min: 1
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  
  // Batch mentor/instructor
  mentor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: true
  },
  
  // Additional instructors
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  
  // Batch status
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Batch settings
  settings: {
    allowLateEnrollment: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxLateEnrollmentDays: {
      type: Number,
      default: 7
    }
  },
  
  // Batch schedule
  schedule: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    sessions: [{
      title: String,
      description: String,
      startTime: Date,
      endTime: Date,
      type: {
        type: String,
        enum: ['live', 'recorded', 'assignment'],
        default: 'live'
      },
      meetingLink: String,
      recordingUrl: String
    }]
  },
  
  // Batch materials
  materials: [{
    title: String,
    description: String,
    fileUrl: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Batch announcements
  announcements: [{
    title: String,
    content: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Batch assignments
  assignments: [{
    title: String,
    description: String,
    dueDate: Date,
    maxMarks: Number,
    instructions: String,
    attachments: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]

}, { 
  timestamps: true 
});

// Indexes for better performance
batchSchema.index({ course: 1, status: 1 });
batchSchema.index({ mentor: 1, status: 1 });
batchSchema.index({ startDate: 1, endDate: 1 });
batchSchema.index({ status: 1, startDate: 1 });

// Virtual for available seats
batchSchema.virtual('availableSeats').get(function() {
  return Math.max(0, this.seats - this.enrolledStudents);
});

// Virtual for batch duration in days
batchSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to check if batch is full
batchSchema.methods.isFull = function() {
  return this.enrolledStudents >= this.seats;
};

// Method to check if enrollment is allowed
batchSchema.methods.canEnroll = function() {
  const now = new Date();
  const isUpcoming = this.status === 'upcoming';
  const isActive = this.status === 'active';
  const hasAvailableSeats = this.enrolledStudents < this.seats;
  const isWithinTimeframe = now >= this.startDate && now <= this.endDate;
  
  return (isUpcoming || isActive) && hasAvailableSeats && isWithinTimeframe;
};

// Method to get batch progress
batchSchema.methods.getProgress = function() {
  const now = new Date();
  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  
  if (totalDuration <= 0) return 0;
  
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};

// Pre-save middleware to update status based on dates
batchSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'upcoming' && now >= this.startDate) {
    this.status = 'active';
  }
  
  if (this.status === 'active' && now > this.endDate) {
    this.status = 'completed';
  }
  
  next();
});

const batchModel = mongoose.models.batch || mongoose.model("batch", batchSchema);

module.exports = batchModel;


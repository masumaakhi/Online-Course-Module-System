# Course Management System

A comprehensive course creation and management system built with MERN stack, implementing all the requirements from FR07-FR12.

## Features Implemented

### 1. Basic Course Information (FR07)
- ✅ Course Title (required)
- ✅ Rich text description with support for long descriptions, bullets, links, code blocks
- ✅ Category dropdown (Web Dev, AI, SQL, UI/UX, etc.)
- ✅ Multi-select tags for better search/filter functionality
- ✅ Cohort selection (general students vs corporate employees)
- ✅ Difficulty levels (Beginner, Intermediate, Advanced)
- ✅ Language selection
- ✅ Prerequisites and Learning Objectives

### 2. Content Upload (FR07)
- ✅ Module/Section creation with drag & drop ordering
- ✅ Lesson Builder with multiple lesson types:
  - Video lessons with file upload
  - PDF documents
  - Quizzes
  - Assignments
- ✅ File upload support via Cloudinary
- ✅ External link support (YouTube, Vimeo, etc.)
- ✅ Duration tracking for video content
- ✅ Lesson descriptions and ordering

### 3. Course Visibility (FR09)
- ✅ Public courses (anyone can browse and enroll)
- ✅ Private courses (only assigned students can access)
- ✅ Proper access control and permission management

### 4. Pricing & Enrollment (FR10, FR11)
- ✅ Free or Paid course toggle
- ✅ Course pricing with discount support
- ✅ Open Enrollment (self-enrollment)
- ✅ Assigned Enrollment (corporate admin assigns students)
- ✅ Price calculation with discount display

### 5. Instructor & Cohort Settings (FR11)
- ✅ Auto-filled instructor information
- ✅ Corporate admin employee assignment
- ✅ Multi-select employee list from corporate users
- ✅ Role-based access control

### 6. Progress Tracking (FR12)
- ✅ Lesson completion tracking
- ✅ Progress percentage calculation
- ✅ Time spent tracking
- ✅ Module completion status
- ✅ Last accessed lesson tracking

### 7. Publish Workflow
- ✅ Save as Draft functionality
- ✅ Course preview before publishing
- ✅ Publish course to make it live
- ✅ Course status management (draft, published, archived)

## Technical Implementation

### Backend (Node.js + Express + MongoDB)

#### Models
- **Course Model**: Complete course schema with modules, lessons, pricing, visibility settings
- **Enrollment Model**: Student enrollment tracking with progress data
- **Batch Model**: Course batch management for corporate training
- **User Model**: Extended with instructor and corporate admin roles

#### Controllers
- **Course Controller**: Full CRUD operations, module/lesson management, publish workflow
- **Enrollment Controller**: Student enrollment, progress tracking, corporate assignments
- **Batch Controller**: Batch creation and management
- **Upload Controller**: Cloudinary integration for file uploads

#### Routes
- **Course Routes**: `/api/courses/*` - Course management endpoints
- **Enrollment Routes**: `/api/enrollments/*` - Enrollment and progress tracking
- **Batch Routes**: `/api/batches/*` - Batch management
- **Upload Routes**: `/api/upload/*` - File upload endpoints

#### Validation
- Comprehensive input validation using express-validator
- Role-based access control middleware
- File upload validation and security

### Frontend (React + Tailwind CSS)

#### Multi-Step Course Creation Form
1. **Basic Information Step**: Course details, category, tags, prerequisites
2. **Content Upload Step**: Module and lesson creation with file upload
3. **Pricing & Visibility Step**: Course pricing and access settings
4. **Assign Users Step**: Corporate employee assignment (conditional)
5. **Review & Publish Step**: Final review and publish options

#### Key Components
- **BasicInfoStep**: Course basic information form
- **ContentUploadStep**: Module/lesson builder with file upload
- **PricingVisibilityStep**: Pricing and visibility configuration
- **AssignUsersStep**: Corporate user assignment
- **ReviewPublishStep**: Final review and publish workflow

#### Additional Pages
- **InstructorDashboard**: Course management dashboard for instructors
- **CourseCatalog**: Public course listing and search
- **CreateCourse**: Main course creation page

## API Endpoints

### Course Management
```
POST   /api/courses                    - Create new course
GET    /api/courses                    - List public courses
GET    /api/courses/:id                - Get single course
PATCH  /api/courses/:id                - Update course
DELETE /api/courses/:id                - Delete course
POST   /api/courses/:id/publish        - Publish course
POST   /api/courses/:id/draft          - Save as draft
```

### Module Management
```
POST   /api/courses/:id/modules        - Add module
PATCH  /api/courses/:id/modules/:moduleId - Update module
DELETE /api/courses/:id/modules/:moduleId - Delete module
```

### Lesson Management
```
POST   /api/courses/:id/modules/:moduleId/lessons - Add lesson
PATCH  /api/courses/:id/modules/:moduleId/lessons/:lessonId - Update lesson
DELETE /api/courses/:id/modules/:moduleId/lessons/:lessonId - Delete lesson
```

### Enrollment Management
```
POST   /api/enrollments/open           - Self-enroll in course
POST   /api/enrollments/assign         - Assign employees to course
GET    /api/enrollments/mine           - Get my enrollments
POST   /api/enrollments/:id/progress   - Update progress
POST   /api/enrollments/:id/rating     - Add rating/review
```

### File Upload
```
POST   /api/upload/course-thumbnail    - Upload course thumbnail
POST   /api/upload/lesson-file         - Upload lesson file
POST   /api/upload/batch-material      - Upload batch material
DELETE /api/upload/file/:publicId      - Delete file
```

## Database Schema

### Course Schema
```javascript
{
  title: String (required),
  description: String,
  category: String (enum),
  tags: [String],
  audience: String (enum: 'general', 'corporate'),
  visibility: String (enum: 'public', 'private'),
  pricing: {
    plan: String (enum: 'free', 'paid'),
    price: Number,
    discount: Number
  },
  enrollmentType: String (enum: 'open', 'assigned'),
  owner: ObjectId (ref: 'user'),
  modules: [ModuleSchema],
  status: String (enum: 'draft', 'published', 'archived'),
  // ... additional fields
}
```

### Module Schema
```javascript
{
  name: String (required),
  description: String,
  lessons: [LessonSchema],
  order: Number
}
```

### Lesson Schema
```javascript
{
  title: String (required),
  type: String (enum: 'Video', 'PDF', 'Quiz', 'Assignment'),
  duration: String,
  fileUrl: String,
  link: String,
  description: String,
  order: Number
}
```

### Enrollment Schema
```javascript
{
  course: ObjectId (ref: 'course'),
  student: ObjectId (ref: 'user'),
  assignedBy: ObjectId (ref: 'user'),
  status: String (enum: 'active', 'completed', 'cancelled'),
  progress: {
    completedLessonIds: [ObjectId],
    percentage: Number,
    timeSpent: Number,
    lastAccessedLesson: ObjectId
  }
}
```

## File Upload Integration

### Cloudinary Configuration
- Video uploads for lesson content
- Image uploads for course thumbnails
- Document uploads for PDFs and materials
- Automatic file optimization and CDN delivery
- Secure file deletion capabilities

### Supported File Types
- **Videos**: MP4, AVI, MOV
- **Images**: JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX, PPT, PPTX

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin, instructor, corporateAdmin, student)
- Protected routes with middleware
- Session management

### Input Validation
- Server-side validation using express-validator
- Client-side form validation
- File upload security
- XSS protection

### Data Protection
- Password hashing with bcrypt
- Secure file upload handling
- Input sanitization
- CORS configuration

## Usage Instructions

### For Instructors
1. Navigate to `/create-course` to start creating a course
2. Follow the 5-step process:
   - Basic Information
   - Content Upload
   - Pricing & Visibility
   - Assign Users (if corporate)
   - Review & Publish
3. Use the instructor dashboard at `/instructor/dashboard` to manage courses

### For Students
1. Browse courses at `/courses`
2. Use filters to find relevant courses
3. Enroll in open courses or wait for corporate assignment
4. Track progress through enrolled courses

### For Corporate Admins
1. Create courses with "corporate" audience
2. Set enrollment type to "assigned"
3. Assign employees to courses in step 4
4. Monitor employee progress and completion

## Environment Variables

### Backend (.env)
```
PORT=5250
MONGODB_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### Frontend
```
REACT_APP_BACKEND_URL=http://localhost:5250
```

## Installation & Setup

### Backend
```bash
cd backend
npm install
npm run server
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Future Enhancements

1. **Advanced Analytics**: Course performance metrics, student engagement tracking
2. **Certificate Generation**: Automatic certificate creation upon course completion
3. **Discussion Forums**: Course-specific discussion boards
4. **Live Sessions**: Integration with video conferencing for live classes
5. **Mobile App**: React Native mobile application
6. **Payment Integration**: Stripe/PayPal integration for paid courses
7. **Advanced Search**: Elasticsearch integration for better search capabilities
8. **Notification System**: Email and push notifications for course updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.



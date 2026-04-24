# ScholarSlate CBT Backend - Product Requirements Document (PRD)

## 1. Executive Summary

ScholarSlate is a comprehensive Computer-Based Testing (CBT) platform designed for secondary school students. This PRD outlines the backend requirements for a scalable, secure, and performant system that supports student examinations, administrative management, and real-time exam monitoring.

## 2. Product Overview

### 2.1 Vision
To provide a reliable, secure, and user-friendly CBT platform that enables fair, monitored examinations while giving administrators full control over content and student management.

### 2.2 Key Features
- Student authentication and profile management
- Subject and question bank management
- Real-time exam sessions with timer management
- Secure exam environment with anti-cheating measures
- Comprehensive result tracking and analytics
- Administrative dashboard for content management
- CSV import/export functionality
- Real-time monitoring and session management

## 3. Technical Requirements

### 3.1 Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Fastify (for high performance and low overhead)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma (with type safety)
- **Authentication**: JWT with refresh tokens
- **Validation**: JSON Schema (built into Fastify)
- **Caching**: Redis (for session management and caching)
- **File Storage**: Local file system or cloud storage (AWS S3)
- **Real-time**: WebSockets (for live exam monitoring)

### 3.2 Performance Requirements
- **Response Time**: <200ms for API calls, <50ms for cached data
- **Concurrent Users**: Support 1000+ simultaneous exam sessions
- **Database Queries**: Optimized with proper indexing
- **Scalability**: Horizontal scaling with load balancer
- **Uptime**: 99.9% availability

### 3.3 Security Requirements
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control (Student, Admin, Super Admin)
- **Data Encryption**: AES-256 for sensitive data at rest
- **HTTPS**: Mandatory for all communications
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **Audit Logging**: All admin actions and exam events logged

## 4. Database Schema

### 4.1 Core Tables

#### Users (Students & Admins)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) UNIQUE, -- NULL for admins
  username VARCHAR(100) UNIQUE, -- NULL for students
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- NULL for students (ID-based auth)
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin', 'super_admin')),
  class VARCHAR(50), -- NULL for admins
  phone VARCHAR(20),
  gender VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Subjects
```sql
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  icon_key VARCHAR(50) DEFAULT 'book',
  icon_bg VARCHAR(7) DEFAULT '#fff3e0',
  active BOOLEAN DEFAULT false,
  time_limit INTEGER NOT NULL, -- in minutes
  max_attempts INTEGER DEFAULT 1,
  description TEXT,
  questions_count INTEGER DEFAULT 0,
  credits INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Questions
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings
  correct_answer INTEGER NOT NULL, -- Index of correct option
  difficulty VARCHAR(20) DEFAULT 'Standard' CHECK (difficulty IN ('Easy', 'Standard', 'Hard')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Exam Sessions
```sql
CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  time_limit INTEGER NOT NULL, -- in seconds
  time_remaining INTEGER NOT NULL, -- in seconds
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'expired', 'terminated')),
  answers JSONB DEFAULT '{}', -- question_id -> selected_option_index
  flagged JSONB DEFAULT '[]', -- Array of question_ids
  score DECIMAL(5,2), -- Calculated after submission
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Results
```sql
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id),
  subject_id INTEGER REFERENCES subjects(id),
  score DECIMAL(5,2) NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  unanswered INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_used VARCHAR(20), -- "45m 30s" format
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

#### Audit Logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Indexes
```sql
-- Performance indexes
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subjects_active ON subjects(active);
CREATE INDEX idx_questions_subject_id ON questions(subject_id);
CREATE INDEX idx_exam_sessions_student_id ON exam_sessions(student_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX idx_results_student_id ON results(student_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## 5. API Specification

### 5.1 Authentication Endpoints

#### POST /api/auth/login
**Student Login**
- **Body**: `{ "studentId": "SS2/2024/001" }`
- **Response**: `{ "token": "jwt_token", "user": {...}, "role": "student" }`

#### POST /api/auth/admin-login
**Admin Login**
- **Body**: `{ "username": "admin", "password": "password" }`
- **Response**: `{ "token": "jwt_token", "user": {...}, "role": "admin" }`

#### POST /api/auth/refresh
**Refresh Token**
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response**: `{ "token": "new_jwt_token" }`

### 5.2 Student Endpoints

#### GET /api/students/profile
**Get Student Profile**
- **Auth**: Required (Student)
- **Response**: Student object

#### GET /api/students/results
**Get Student Results History**
- **Auth**: Required (Student)
- **Response**: Array of Result objects

### 5.3 Subject Endpoints

#### GET /api/subjects
**Get All Active Subjects**
- **Auth**: Required
- **Response**: Array of Subject objects with student-specific fields

#### PUT /api/subjects/:id
**Update Subject**
- **Auth**: Required (Admin+)
- **Body**: Partial Subject object
- **Response**: Updated Subject object

#### POST /api/subjects
**Create Subject**
- **Auth**: Required (Admin+)
- **Body**: Subject object (without id)
- **Response**: Created Subject object

#### DELETE /api/subjects/:id
**Delete Subject**
- **Auth**: Required (Super Admin)
- **Response**: Success message

### 5.4 Question Endpoints

#### GET /api/questions?subjectId=:id
**Get Questions by Subject**
- **Auth**: Required (Admin for all, Student for active exam)
- **Response**: Array of Question objects

#### POST /api/questions
**Create Question**
- **Auth**: Required (Admin+)
- **Body**: Question object
- **Response**: Created Question object

#### POST /api/questions/upload
**Upload Questions CSV**
- **Auth**: Required (Admin+)
- **Body**: FormData with CSV file
- **Response**: `{ "message": "Success", "count": 50 }`

### 5.5 Exam Endpoints

#### POST /api/exams/start
**Start Exam Session**
- **Auth**: Required (Student)
- **Body**: `{ "subjectId": 1 }`
- **Response**: ExamSession object with questions

#### GET /api/exams/session/:sessionId
**Get Exam Session**
- **Auth**: Required (Student - session owner)
- **Response**: ExamSession object

#### POST /api/exams/session/:sessionId/answer
**Save Answer**
- **Auth**: Required (Student - session owner)
- **Body**: `{ "questionId": "uuid", "answer": 0 }`
- **Response**: Success message

#### POST /api/exams/session/:sessionId/flag
**Flag/Unflag Question**
- **Auth**: Required (Student - session owner)
- **Body**: `{ "questionId": "uuid", "flagged": true }`
- **Response**: Success message

#### POST /api/exams/session/:sessionId/submit
**Submit Exam**
- **Auth**: Required (Student - session owner)
- **Response**: Result object

### 5.6 Admin Endpoints

#### GET /api/admin/students
**Get All Students**
- **Auth**: Required (Admin+)
- **Response**: Array of Student objects

#### POST /api/admin/students/upload
**Upload Students CSV**
- **Auth**: Required (Admin+)
- **Body**: FormData with CSV file
- **Response**: `{ "message": "Success", "count": 100 }`

#### GET /api/admin/results
**Get All Results**
- **Auth**: Required (Admin+)
- **Query**: `?subjectId=1&startDate=2024-01-01&endDate=2024-12-31`
- **Response**: Array of Result objects with student details

## 6. Business Logic

### 6.1 Exam Flow
1. **Start Exam**:
   - Validate student eligibility (active, attempts remaining)
   - Create exam session with shuffled questions
   - Set timer based on subject time limit
   - Return session with questions

2. **During Exam**:
   - Track time remaining (server-side)
   - Save answers in real-time
   - Allow flagging questions
   - Prevent multiple tabs/windows (client-side + server validation)

3. **Submit Exam**:
   - Auto-submit on timer expiry
   - Calculate score and statistics
   - Create result record
   - Update student attempt count

### 6.2 Security Measures
- **Session Validation**: Each request validates session ownership
- **Time Tracking**: Server maintains authoritative timer
- **Answer Encryption**: Sensitive data encrypted in transit/storage
- **Rate Limiting**: Prevent API abuse
- **Audit Trail**: All actions logged for review

### 6.3 Anti-Cheating Features
- **Timer Management**: Server-controlled countdown
- **Tab Monitoring**: Client reports focus changes
- **Session Locking**: One active session per student
- **Answer Validation**: Server validates answer submissions
- **Suspicious Activity**: Flag unusual patterns for review

## 7. Error Handling

### 7.1 HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (business rule violation)
- `422`: Unprocessable Entity (validation failed)
- `429`: Too Many Requests
- `500`: Internal Server Error

### 7.2 Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "studentId",
      "reason": "Must be in format SS2/YYYY/XXX"
    }
  }
}
```

## 8. Monitoring & Analytics

### 8.1 Key Metrics
- **System Health**: Response times, error rates, uptime
- **User Activity**: Active sessions, login rates, completion rates
- **Exam Statistics**: Average scores, time usage, question difficulty
- **Security Events**: Failed logins, suspicious activities

### 8.2 Logging
- **Application Logs**: Structured JSON logs with correlation IDs
- **Audit Logs**: All admin actions and exam events
- **Performance Logs**: Slow queries, high memory usage
- **Security Logs**: Authentication failures, unauthorized access

## 9. Deployment & DevOps

### 9.1 Environment Setup
- **Development**: Local PostgreSQL + Redis
- **Staging**: Cloud database with automated deployments
- **Production**: Managed PostgreSQL + Redis with backups

### 9.2 CI/CD Pipeline
- **Automated Testing**: Unit, integration, and E2E tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Security Scanning**: Dependency vulnerability checks
- **Deployment**: Blue-green deployments with zero downtime

### 9.3 Backup & Recovery
- **Database Backups**: Daily automated backups with 30-day retention
- **Disaster Recovery**: Multi-region failover capability
- **Data Retention**: Configurable retention policies for logs and old data

## 10. Future Enhancements

### 10.1 Phase 2 Features
- **Real-time Proctoring**: Video/audio monitoring
- **Question Randomization**: Advanced shuffling algorithms
- **Analytics Dashboard**: Detailed performance insights
- **Mobile App**: React Native companion app
- **Integration APIs**: LMS integration (Moodle, Canvas)

### 10.2 Scalability Improvements
- **Microservices**: Split into exam-service, user-service, analytics-service
- **CDN**: Static asset delivery
- **Caching**: Advanced Redis caching strategies
- **Queue System**: Background job processing

## 11. Success Criteria

### 11.1 Functional Requirements
- ✅ Support 1000+ concurrent exam sessions
- ✅ <2 second page load times
- ✅ 99.9% uptime during exam periods
- ✅ Zero data loss in exam submissions
- ✅ Comprehensive audit trail

### 11.2 User Experience
- ✅ Intuitive admin interface for content management
- ✅ Reliable exam environment with minimal disruptions
- ✅ Fast result processing and display
- ✅ Mobile-responsive design

### 11.3 Security & Compliance
- ✅ SOC 2 Type II compliance
- ✅ GDPR compliance for data protection
- ✅ Secure exam environment preventing cheating
- ✅ Comprehensive access controls

## 12. Conclusion

This PRD provides a comprehensive blueprint for building a robust, scalable CBT backend system. The architecture supports the current frontend requirements while providing a solid foundation for future enhancements. The focus on security, performance, and reliability ensures the system can handle real-world educational testing scenarios at scale.
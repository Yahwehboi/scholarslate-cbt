# Frontend Status and Backend Handoff

## Purpose

This document captures the current frontend state of ScholarSlate CBT, the work already completed, the remaining frontend gaps, and the recommended order for backend integration.

Use this as the main reference when connecting the frontend to the backend.

## Current State

The frontend is now stable enough to begin backend work.

The following core pieces are already in place:

- Student login uses registered Student ID records.
- Student and admin routes are protected by role.
- Admin and student navigation are separated correctly.
- Admin has separate pages for:
  - Subjects Control
  - Upload Questions
  - Students
  - View Results
- Registered students can be viewed from the admin side.
- Student identity is read from session state in the main student flow.
- The project builds successfully with `npm run build`.

## What Has Been Implemented

### Authentication and Session Shell

Implemented files:

- `src/lib/auth.ts`
- `src/context/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/pages/LoginPage.tsx`

What is working:

- Student login is based on Student ID.
- Student login checks against registered student records.
- Admin login now requires credentials.
- Sessions persist in local storage for the prototype.
- Protected routes redirect unauthorized users.
- Logout clears session state.

Current demo admin credentials:

- Username: `admin`
- Password: `admin123`

Note:
This admin credential flow is temporary and only for prototype use. It must be replaced with backend authentication.

### Admin Navigation Fixes

Implemented and corrected:

- Admin sidebar links no longer collide with one another.
- `Students` now opens its own page.
- `View Results` now opens its own admin page.
- Active link highlighting is handled per admin route.

Relevant files:

- `src/pages/AdminControlPage.tsx`
- `src/pages/AdminUploadPage.tsx`
- `src/pages/AdminStudentsPage.tsx`
- `src/pages/AdminResultsPage.tsx`

### Admin Students Page

Implemented file:

- `src/pages/AdminStudentsPage.tsx`

What it does:

- Displays registered students.
- Shows total student count.
- Supports search by Student ID, name, or class.
- Uses the same local storage registry currently used by Student ID login.

### Admin Results Page

Implemented file:

- `src/pages/AdminResultsPage.tsx`

What it does:

- Displays a dedicated admin results dashboard.
- Separates admin result viewing from the student results page.

Note:
This page still uses mock data and is waiting for backend integration.

## Important Remaining Frontend Gaps

These are not reasons to delay backend, but they still need to be completed during integration.

### 1. Replace Local Storage Auth and Registry

Current prototype behavior:

- Student registry is stored in browser local storage.
- Session is stored in browser local storage.
- Admin login is local/demo only.

What backend should replace:

- Student lookup by Student ID
- Admin authentication
- Session/token issuance
- User profile retrieval

### 2. Replace Mock Exam Flow

Current file:

- `src/pages/ExamPage.tsx`

Current behavior:

- Questions are hardcoded.
- Scoring is calculated on the client.
- Submission is local navigation only.

What backend should replace:

- Start exam session
- Fetch subject questions
- Save answers during exam
- Submit exam session
- Return result payload

### 3. Replace Mock Student Results History

Current file:

- `src/pages/ResultsHistoryPage.tsx`

Current behavior:

- Uses mock history data.
- Not yet connected to real exam submissions.

What backend should provide:

- Student results history endpoint
- Filtering by date/status/subject

### 4. Replace Mock Admin Results Data

Current file:

- `src/pages/AdminResultsPage.tsx`

Current behavior:

- Uses placeholder result rows.

What backend should provide:

- Admin results listing endpoint
- Filters by subject/date/status/student
- Aggregate stats

### 5. Replace Prototype Student Registration Persistence

Current files:

- `src/pages/AdminUploadPage.tsx`
- `src/lib/auth.ts`

Current behavior:

- Student upload stores students locally in the browser.

What backend should provide:

- Batch student registration endpoint
- Student uniqueness validation
- Persistent storage in database

### 6. Profile Editing Is Not Yet Real

Current file:

- `src/pages/StudentProfilePage.tsx`

Current behavior:

- Session values are displayed.
- Editing is not backed by API.
- Password change is not real.

What backend should provide:

- Get student profile
- Update student profile
- Change password or credentials flow if required

## Recommended Backend Integration Order

### Phase 1. Authentication and User Registry

Build first:

- Admin login endpoint
- Student login by Student ID endpoint
- Get current session/user endpoint
- Student registry persistence

Why first:

- It replaces the most important prototype-only logic.
- It gives the frontend a real identity/session source.

### Phase 2. Subjects and Question Bank

Build next:

- Get subjects
- Create/update subjects
- Upload questions
- List questions by subject

Why next:

- Admin workflows depend on it.
- Student subject selection depends on real data.

### Phase 3. Exam Session Flow

Build after that:

- Start exam session
- Fetch active session
- Save answer
- Flag/unflag question
- Submit exam

Why next:

- This replaces the current hardcoded core exam logic.

### Phase 4. Results and Analytics

Build next:

- Student results history
- Admin results dashboard
- Aggregate performance metrics

Why next:

- This unlocks both the student history page and admin results page.

### Phase 5. Student Profile and Settings

Build after core exam flow:

- Get profile
- Update profile
- Change password if applicable

Why later:

- Less critical than authentication, subjects, and exam flow.

## Recommended Frontend Preparation Before API Wiring

These are optional but helpful before connecting real endpoints.

### Create Shared API Modules

Suggested structure:

- `src/api/auth.ts`
- `src/api/students.ts`
- `src/api/admin.ts`
- `src/api/exams.ts`
- `src/api/results.ts`
- `src/types/api.ts`

Why:

- Keeps fetch logic out of page components.
- Makes the frontend easier to switch from mock to real backend.

### Centralize Shared Admin Layout

Currently duplicated across multiple admin pages:

- sidebar structure
- header structure
- active route mapping

Suggested future improvement:

- extract a shared admin layout component

Why:

- reduces duplicated logic
- makes future admin pages easier to add

### Fix CSS Import Warnings

Current build warning:

- CSS `@import` rules are not at the top of the stylesheet.

This is not blocking build, but should be cleaned up later.

## Backend Alignment Notes

The repo already contains a backend PRD:

- `BACKEND_PRD.md`

That PRD describes the intended backend stack and major API directions, including:

- Fastify
- PostgreSQL
- Prisma
- JWT auth
- Redis
- WebSockets for monitoring

This handoff document should be used together with `BACKEND_PRD.md`.

## Immediate Next Recommendation

The best next move is to begin backend work now.

Suggested first backend task:

1. Define the auth and student registry API contract.
2. Implement admin login and student login endpoints.
3. Replace local auth/session logic in the frontend with real API calls.

## Status Summary

Frontend status: ready for backend integration

Not yet production-ready because:

- auth is still local/demo
- student registry is still local storage
- exam/questions/results are still partly mock-driven

But the app shell is now organized well enough to move forward safely.

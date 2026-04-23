# ScholarSlate CBT Execution Plan (Feature-by-Feature)

## 1. Goal

Move from prototype to production-ready offline/LAN CBT system by implementing features from highest risk and highest impact to lowest priority, with clear acceptance gates for each phase.

## 2. Working Rules (Mandatory)

1. Build strictly in phase order.
2. Do not start a new phase until the current phase acceptance checklist is fully passed.
3. Every feature must include backend implementation, frontend integration, validation, and tests before being marked done.
4. Keep API contracts stable once consumed by frontend; use additive changes only.
5. Treat exam correctness and data integrity as higher priority than UI polish.

## 3. Priority Order

1. Authentication and User Registry
2. Subjects and Question Bank
3. Exam Session Core Flow
4. Results and Scoring
5. Admin Results and Analytics
6. Student Profile and Settings
7. Deployment Packaging and Operations
8. Hardening, Performance, and Release Readiness

## 4. Delivery Structure

Each phase is complete only when all items below are done:

- Backend endpoints implemented and validated.
- DB schema and migrations implemented.
- Frontend wired to real APIs.
- Error handling and empty states implemented.
- Audit logging added for relevant admin and exam actions.
- Test checklist passed.
- Documentation updated.

## 5. Phase-by-Phase Plan

## Phase 0: Foundations and Guardrails

### Objective

Establish backend project skeleton and non-negotiable infrastructure for all later phases.

### Scope

- Create backend app structure with Express + TypeScript.
- Add SQLite connection setup and Drizzle ORM setup.
- Add environment configuration and runtime config validation.
- Add base middleware: CORS for LAN, JSON parser limits, request logging, error handler.
- Add health endpoint: GET /api/health.
- Add JWT utilities and auth middleware skeleton.
- Add audit log utility.

### Acceptance Criteria

- App starts locally with one command.
- SQLite database auto-creates on first run.
- Health endpoint returns status, version, and timestamp.
- Unhandled errors return stable JSON error shape.
- Basic lint/build scripts pass.

### Test Checklist

- Unit test for config validation.
- Smoke test for health endpoint.
- Error middleware test for unknown route and server error.

## Phase 1: Authentication and User Registry (Highest Priority)

### Objective

Replace all prototype local-storage auth and student registry logic with server-authoritative authentication and persistence.

### Scope

- Admin login endpoint.
- Student login by student ID endpoint.
- Current session endpoint.
- User entity and role-based access control middleware.
- Student registry persistence and retrieval.
- Token expiration handling and logout behavior.

### Endpoints

- POST /api/auth/login (student)
- POST /api/auth/admin-login
- GET /api/auth/me
- POST /api/auth/logout (stateless token invalidation strategy documented)
- Admin user management starter endpoints as needed for registry read/list

### Frontend Integration Targets

- src/pages/LoginPage.tsx
- src/context/AuthContext.tsx
- src/lib/auth.ts
- src/components/ProtectedRoute.tsx
- src/pages/AdminStudentsPage.tsx

### Acceptance Criteria

- Student login works using real DB records.
- Admin login no longer uses demo hardcoded credentials.
- Route protection is based on server-issued token and role.
- Session restore validates token via GET /api/auth/me.
- Admin Students page reads from backend list endpoint.

### Test Checklist

- Unit tests for token creation/verification and role middleware.
- Integration tests for login success/failure scenarios.
- Authorization tests for student/admin route access.

## Phase 2: Subjects and Question Bank

### Objective

Enable real subject management and question authoring/upload pipeline for admin workflows.

### Scope

- CRUD endpoints for subjects.
- Question CRUD endpoints.
- CSV upload endpoint with strict validation and import summary.
- Question retrieval by subject with role-aware filtering.
- Indexing for subject and question lookup performance.

### Endpoints

- GET /api/subjects
- POST /api/subjects
- PUT /api/subjects/:id
- DELETE /api/subjects/:id
- GET /api/questions?subjectId=:id
- POST /api/questions
- PUT /api/questions/:id
- DELETE /api/questions/:id
- POST /api/questions/upload

### Frontend Integration Targets

- src/pages/AdminControlPage.tsx
- src/pages/AdminUploadPage.tsx
- src/pages/SelectSubjectPage.tsx

### Acceptance Criteria

- Admin can create and update subjects from UI.
- CSV upload imports valid questions and rejects invalid rows with clear reasons.
- Student subject selection reads live active subjects.
- Questions are persisted and retrievable per subject.

### Test Checklist

- CSV parser and validation unit tests.
- Integration tests for subject and question CRUD.
- Negative tests for invalid payloads and permissions.

## Phase 3: Exam Session Core Flow

### Objective

Replace hardcoded exam runtime with server-authoritative exam session management.

### Scope

- Start exam session endpoint.
- Fetch active session endpoint.
- Save answer endpoint.
- Flag/unflag endpoint.
- Submit exam endpoint.
- Server-side timer and expiration logic.
- Anti-cheating core checks based on PRD rules.

### Endpoints

- POST /api/exams/start
- GET /api/exams/session/:sessionId
- PATCH /api/exams/session/:sessionId/answer
- PATCH /api/exams/session/:sessionId/flag
- POST /api/exams/session/:sessionId/submit

### Frontend Integration Targets

- src/pages/ExamInstructions.tsx
- src/pages/ExamPage.tsx
- src/pages/ResultPage.tsx

### Acceptance Criteria

- Exam start creates one active session per student/subject attempt policy.
- Answers autosave successfully and survive refresh.
- Timer is server authoritative and cannot be bypassed client-side.
- Submission finalizes session and blocks further edits.
- Expired session auto-transitions to expired/submitted policy.

### Test Checklist

- Session lifecycle integration tests.
- Timer expiration tests.
- Idempotency test for repeated submit calls.
- Concurrency test for rapid answer updates.

## Phase 4: Results and Scoring

### Objective

Generate reliable scoring outputs and expose student-facing result history.

### Scope

- Scoring engine on submission.
- Result record creation and persistence.
- Student results history endpoint with filters.
- Result detail endpoint.

### Endpoints

- GET /api/students/results
- GET /api/students/results/:resultId

### Frontend Integration Targets

- src/pages/ResultPage.tsx
- src/pages/ResultsHistoryPage.tsx
- src/pages/DashboardPage.tsx

### Acceptance Criteria

- Result data matches submitted answers and marking scheme.
- Student can view historical attempts by subject and date.
- History page no longer uses mock data.

### Test Checklist

- Scoring correctness unit tests.
- Integration test from submit to result retrieval.
- Edge-case tests for unanswered questions and partial submissions.

## Phase 5: Admin Results and Analytics

### Objective

Deliver operational visibility for admins on performance and exam outcomes.

### Scope

- Admin results listing endpoint.
- Filter support by subject/date/student/status.
- Basic aggregate metrics endpoint.
- Export-ready response format (CSV-friendly).

### Endpoints

- GET /api/admin/results
- GET /api/admin/results/metrics

### Frontend Integration Targets

- src/pages/AdminResultsPage.tsx

### Acceptance Criteria

- Admin results page fully driven by live API.
- Filters return accurate narrowed datasets.
- Aggregate metrics match raw records.

### Test Checklist

- Permission tests for admin-only access.
- Aggregation accuracy tests.
- Filter correctness integration tests.

## Phase 6: Student Profile and Settings

### Objective

Enable reliable profile retrieval and controlled updates.

### Scope

- Get student profile endpoint.
- Update profile endpoint with field-level validation.
- Credential change flow if required by role policy.

### Endpoints

- GET /api/students/profile
- PUT /api/students/profile
- PUT /api/students/profile/password (if enabled)

### Frontend Integration Targets

- src/pages/StudentProfilePage.tsx

### Acceptance Criteria

- Profile page displays backend data.
- Valid updates persist and are reflected immediately.
- Invalid updates return clear validation errors.

### Test Checklist

- Validation tests for allowed/blocked fields.
- Profile update integration tests.

## Phase 7: Deployment Packaging and Operations

### Objective

Make the system reliably deployable by non-technical school admins.

### Scope

- Build Windows executable package.
- Include SQLite native binding and public assets.
- Create launcher script and startup verification.
- Define backup and restore runbook for data file.
- Add server status badge support via health endpoint.

### Deliverables

- Deployment folder artifact with launcher.
- Step-by-step operator guide.
- Backup and restore checklist.

### Acceptance Criteria

- Clean machine can launch app by double-clicking launcher.
- Browser opens app successfully.
- Data persists across restarts.
- Backup copy and restore procedure tested.

### Test Checklist

- Fresh-machine smoke test.
- Restart persistence test.
- Backup restore drill.

## Phase 8: Hardening and Release Readiness

### Objective

Finish reliability, security, and performance checks required before production school use.

### Scope

- Rate limiting and request size limits reviewed and tuned.
- Validation coverage audit for all write endpoints.
- Audit logging coverage audit.
- SQLite tuning (WAL mode, busy timeout) validated under expected load.
- Final bug bash and regression pass.

### Acceptance Criteria

- No critical or high severity defects open.
- All phase test checklists pass.
- Performance acceptable for 50-150 concurrent users in LAN simulation.
- Release notes and known limitations documented.

### Test Checklist

- End-to-end regression suite.
- Basic load simulation for key exam endpoints.
- Security checklist pass.

## 6. Definition of Done (Per Feature)

A feature is done only when:

- Code implemented and reviewed.
- API documented.
- Frontend integrated.
- Validation and authorization enforced.
- Logging and error handling included.
- Automated tests added and passing.
- Manual QA checklist passed.

## 7. Immediate Next Actions (Start Now)

1. Create backend folder and initialize Express + TypeScript + Drizzle + SQLite baseline.
2. Implement Phase 0 health, config, and global error handling.
3. Begin Phase 1 auth endpoints and frontend login wiring.
4. Replace prototype local auth path completely before moving to Phase 2.

## 8. Tracking Template

Use this for each phase during execution:

- Status: Not Started | In Progress | Blocked | Done
- Owner:
- Start Date:
- Target Date:
- Risks:
- Completed Endpoints:
- Frontend Screens Integrated:
- Tests Added:
- Sign-off:

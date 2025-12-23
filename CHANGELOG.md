# Changelog

All notable changes to the Clinic Queue System are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-17

### Security Enhancements

#### Added
- **Rate Limiting** on all critical endpoints
  - Authentication: 5 attempts per 15 minutes
  - Booking: 3 attempts per 5 minutes
  - Notifications: 10 attempts per 10 minutes
  - API endpoints: 60 requests per minute
- **Input Sanitization** library ([lib/sanitize.ts](lib/sanitize.ts))
  - XSS protection with HTML escaping
  - SQL injection detection
  - NoSQL injection detection
  - Type-specific sanitization (names, emails, phones, text)
- **Security Headers Middleware** ([middleware.ts](middleware.ts))
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options (clickjacking protection)
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy
- **Environment Variable Validation** with Zod schemas
- **Enhanced Zod Validation** schemas
  - Length constraints (min/max)
  - Pattern matching (regex)
  - Type refinement (enums)
  - Custom validators

#### Changed
- Updated authentication routes with rate limiting protection
- Enhanced booking API with input sanitization
- Strengthened user management endpoints with security checks
- Improved audit logging with security event tracking

### Performance Improvements

#### Added
- **Database Indexes** (11 indexes across models)
  - Appointment: queueNumber, status, patient, createdAt
  - Patient: phone, email, fullName (text search)
  - User: email, role
  - Compound indexes for filtered sorting
- **Pagination** on all list endpoints
  - Configurable page size (max 100 items)
  - Total count and page metadata
  - Skip/limit optimization
- **Connection Pooling** for MongoDB
  - maxPoolSize: 10
  - minPoolSize: 5
  - Optimized timeouts
- **Performance Monitoring** utilities ([lib/performance.ts](lib/performance.ts))
  - Execution time measurement
  - Database query tracking
  - Memory usage statistics
  - Request timing helpers

#### Changed
- Enhanced MongoDB connection with event handlers
- Optimized database queries with `.lean()` and indexes
- Implemented concurrent queries with `Promise.all()`

### Infrastructure

#### Added
- **Structured Logging** with Pino ([lib/logger.ts](lib/logger.ts))
  - Context-specific loggers (api, db, auth)
  - JSON formatting for production
  - Pretty printing for development
  - Error tracking with stack traces
- **Health Check Endpoint** ([app/api/health/route.ts](app/api/health/route.ts))
  - Database connection status
  - Memory usage monitoring
  - System uptime tracking
- **API Error Handling** utilities ([lib/apiError.ts](lib/apiError.ts))
  - Standardized error responses
  - ApiError class for structured errors
  - Common error factories
  - Success response helpers
- **Error Boundaries** for React
  - GlobalErrorBoundary component
  - Graceful error fallback UI
  - Development mode error details
  - Error logging integration
- **Testing Infrastructure**
  - Jest configuration
  - React Testing Library setup
  - Sample test suites
  - Coverage reporting
- **Docker Support**
  - Multi-stage Dockerfile
  - docker-compose.yml with MongoDB and Redis
  - .dockerignore optimization
- **CI/CD Pipeline** (GitHub Actions)
  - Linting and type checking
  - Automated testing
  - Security audits
  - Build verification
  - Deployment automation
- **Database Backup Scripts**
  - backup-db.sh (automated backups)
  - restore-db.sh (recovery)
  - Compression and cloud upload support

### Documentation

#### Added
- Comprehensive [README.md](README.md) update
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Detailed improvement summary
- [.env.example](.env.example) - Safe environment template
- [CHANGELOG.md](CHANGELOG.md) - This file
- API documentation with rate limits
- Deployment guides (Docker, Vercel, Manual)
- Troubleshooting section

### Developer Experience

#### Added
- Type definitions for all utilities
- JSDoc comments for public functions
- Test scripts in package.json
  - `npm test` - Run tests
  - `npm run test:watch` - Watch mode
  - `npm run test:coverage` - Coverage report
- Performance monitoring startup option

#### Changed
- Replaced all `console.error()` with structured logging
- Enhanced TypeScript strict mode compliance
- Improved error messages throughout

### Bug Fixes

#### Fixed
- TypeScript compilation errors in API routes
- Missing type definitions for validator library
- Variable scoping issues in bookings route
- MongoDB connection error handling
- Build-time environment variable validation

### Breaking Changes

#### Changed
- API responses now include pagination metadata
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
  ```
- Error responses standardized across all endpoints
  ```json
  {
    "error": "Error message",
    "details": {...},
    "timestamp": "2025-12-17T..."
  }
  ```
- Rate limiting headers added to all responses
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After` (on 429 responses)

### Dependencies

#### Added
- pino@10.1.0 - Structured logging
- pino-pretty@13.1.3 - Development log formatting
- validator@13.15.23 - Input validation
- @types/validator@13.x - TypeScript types
- jest@29.7.0 - Testing framework
- @testing-library/react@16.3.1 - React testing
- @testing-library/jest-dom@6.9.1 - Jest matchers
- express-rate-limit@8.2.1 - Rate limiting (removed, using custom)

#### Changed
- Updated npm audit fix (reduced vulnerabilities from 8 to 4)

#### Removed
- Unused dependencies cleaned up during audit

---

## [1.0.0] - 2024-XX-XX

### Initial Release

#### Features
- User authentication with NextAuth.js
- Role-based access control (7 roles)
- Appointment booking system
- Queue number generation
- Real-time updates via Pusher
- Email notifications (Nodemailer)
- SMS notifications (Twilio)
- Admin dashboard
- Nurse dashboard with vitals recording
- Doctor dashboard with diagnosis
- Pharmacist dashboard with dispensing
- Lab technician dashboard
- Receptionist dashboard
- Patient slip printing
- PDF prescription export

---

## Legend

- Security
- Performance
- Infrastructure
- Documentation
- Developer Experience
- Bug Fixes
- Breaking Changes
- Dependencies

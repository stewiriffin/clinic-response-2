# 🏥 Clinic Queue System

A production-ready, full-stack Clinic Queue Management System built with **Next.js 14**, **TypeScript**, and **MongoDB**. This system streamlines appointment booking, queue tracking, diagnosis recording, and provides role-based dashboards for clinic staff.

[![CI/CD](https://github.com/your-username/clinic-queue-system/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/your-username/clinic-queue-system/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🔐 Security & Authentication
- ✅ **Secure Authentication** via NextAuth.js with JWT sessions
- ✅ **Role-Based Access Control** (RBAC) for 7 user roles
- ✅ **Rate Limiting** on auth (5/15min), bookings (3/5min), notifications (10/10min)
- ✅ **Input Sanitization** with XSS, SQL, and NoSQL injection protection
- ✅ **Security Headers** (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **Audit Logging** for admin actions
- ✅ **Environment Validation** with Zod schemas

### 📅 Appointment Management
- Auto-generated queue numbers
- Real-time status updates: `waiting`, `in-progress`, `done`
- Live queue updates via **Pusher**
- Email & SMS notifications (optional)
- Appointment rescheduling and cancellation
- Patient slip printing

### 🧑‍⚕️ Role-Based Dashboards

**Admin**
- User management (view, edit roles, delete)
- System metrics dashboard
- Audit logs with full history
- Real-time analytics

**Nurse**
- Vital signs recording (temperature, BP, weight, height)
- Nurse notes
- "Ready for doctor" flag
- Queue filtering

**Doctor**
- Diagnosis recording
- Prescription writing
- Lab test ordering
- Follow-up scheduling
- Doctor-specific queue view

**Pharmacist**
- Prescription retrieval
- Dispense tracking
- PDF export of prescriptions
- Pharmacist notes

**Lab Technician**
- Lab test management
- Result entry with file uploads
- Status tracking (pending/completed)

**Receptionist**
- New appointment booking
- Patient registration
- Queue management
- Slip printing

### 📊 Performance & Monitoring
- ✅ **Database Indexing** (11 indexes for 10-100x faster queries)
- ✅ **Pagination** on all list endpoints
- ✅ **Structured Logging** with Pino (production-ready)
- ✅ **Health Check** endpoint (`/api/health`)
- ✅ **Performance Monitoring** utilities
- ✅ **Error Boundaries** for graceful failures
- ✅ **Connection Pooling** for MongoDB

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.5 | App Router, SSR, API routes |
| TypeScript | 5.8.3 | Static typing |
| MongoDB | 6.16.0 | NoSQL database |
| Mongoose | 8.15.0 | ODM for MongoDB |
| NextAuth.js | 4.24.11 | Authentication |
| Tailwind CSS | 3.3.0 | UI styling |
| Zod | 3.25.20 | Schema validation |
| Pino | 10.1.0 | Structured logging |
| Jest | 29.7.0 | Testing framework |
| Pusher | 5.2.0 | Real-time updates |
| Twilio | 5.7.1 | SMS notifications |
| Nodemailer | 6.9.15 | Email notifications |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or 20+
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/clinic-queue-system.git
cd clinic-queue-system

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your credentials
# (See Configuration section below)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-queue

# NextAuth (Generate: openssl rand -base64 32)
NEXTAUTH_SECRET=your-super-secret-random-string-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# Server
NODE_ENV=development
PORT=3000
```

### Optional Services

**Pusher (Real-time updates)**
```bash
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
```

**Email (SMTP)**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@yourclinic.com
```

**SMS (Twilio)**
```bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🚀 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Current test coverage:
- Sanitization utilities: ✅ Full coverage
- Rate limiting: ✅ Full coverage
- API error handling: ⏳ In progress

---

## 📁 Project Structure

```
clinic-queue-system/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── appointment/     # Appointment endpoints
│   │   ├── bookings/        # Booking endpoints
│   │   ├── users/           # User management
│   │   ├── admin/           # Admin endpoints
│   │   └── health/          # Health check
│   ├── admin/               # Admin dashboard
│   ├── doctor/              # Doctor dashboard
│   ├── nurse/               # Nurse dashboard
│   ├── pharmacist/          # Pharmacist dashboard
│   ├── lab/                 # Lab technician dashboard
│   ├── receptionist/        # Receptionist dashboard
│   ├── login/               # Login page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── ErrorBoundary.tsx    # Error handling
│   └── GlobalErrorBoundary.tsx
├── lib/                     # Utilities
│   ├── mongodb.ts           # Database connection
│   ├── rateLimiter.ts       # Rate limiting
│   ├── sanitize.ts          # Input sanitization
│   ├── logger.ts            # Structured logging
│   ├── apiError.ts          # Error handling
│   ├── performance.ts       # Performance monitoring
│   └── validateEnv.ts       # Env validation
├── models/                  # Mongoose schemas
│   ├── User.ts
│   ├── Patient.ts
│   ├── Appointment.ts
│   ├── AuditLog.ts
│   └── LabTest.ts
├── middleware.ts            # Security headers
├── .github/workflows/       # CI/CD pipelines
├── scripts/                 # Utility scripts
│   ├── backup-db.sh         # Database backup
│   └── restore-db.sh        # Database restore
├── jest.config.js           # Jest configuration
├── Dockerfile               # Docker configuration
└── docker-compose.yml       # Docker Compose setup
```

---

## 🔒 Security Features

### Implemented
- ✅ Rate limiting on critical endpoints
- ✅ Input sanitization (XSS, SQL, NoSQL injection)
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Environment variable validation
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT-based sessions
- ✅ Audit logging for admin actions
- ✅ CSRF protection (via NextAuth)

### Best Practices
- ❌ Secrets never committed to git
- ✅ `.env` files in `.gitignore`
- ✅ Admin-only endpoints protected
- ✅ Strong validation on all inputs
- ✅ Database indexes for performance
- ✅ Error boundaries for graceful failures

---

## 📊 API Documentation

### Core Endpoints

**Authentication**
```
POST /api/auth/[...nextauth]  # Login/logout
```

**Appointments**
```
GET    /api/appointment        # List appointments (paginated)
POST   /api/appointment        # Create appointment
PATCH  /api/appointment/:id    # Update appointment
DELETE /api/appointment/:id    # Delete appointment
```

**Bookings**
```
GET    /api/bookings           # List bookings
POST   /api/bookings           # Create booking
```

**Admin**
```
GET    /api/users              # List users (admin only)
PATCH  /api/users/:id/role     # Update user role (admin only)
DELETE /api/users/:id          # Delete user (admin only)
GET    /api/admin/metrics      # System metrics
GET    /api/admin/audit-logs   # Audit logs
```

**Health**
```
GET    /api/health             # Health check
```

### Rate Limits
- Auth endpoints: 5 requests / 15 minutes
- Booking endpoints: 3 requests / 5 minutes
- Notification endpoints: 10 requests / 10 minutes
- API endpoints: 60 requests / minute

---

## 🛡️ Database Backup & Restore

### Backup Database
```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

Backups are stored in `./backups/` directory.

### Restore Database
```bash
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh backups/clinic-queue-backup-20250101_120000.tar.gz
```

---

## 🐛 Troubleshooting

### Build Errors

**Missing environment variables**
```bash
# Ensure all required variables are set
cp .env.example .env
# Fill in your credentials
```

**MongoDB connection failed**
```bash
# Check your MONGODB_URI
# Ensure MongoDB Atlas allows your IP
# Verify credentials are correct
```

### Runtime Errors

**Rate limit exceeded**
- Wait for the rate limit window to reset
- Check the `Retry-After` header in the response

**Database queries slow**
- Verify indexes are created: Check MongoDB Atlas
- Use pagination on large datasets

---

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- TypeScript strict mode
- ESLint configuration enforced
- Test coverage required for new features
- Security review for authentication changes

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Real-time updates via [Pusher](https://pusher.com/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)

---

## 📞 Support

For issues, questions, or suggestions:
- 🐛 [Open an issue](https://github.com/your-username/clinic-queue-system/issues)
- 💬 [Start a discussion](https://github.com/your-username/clinic-queue-system/discussions)
- 📧 Email: support@yourclinic.com

---

**Made with ❤️ for healthcare providers**

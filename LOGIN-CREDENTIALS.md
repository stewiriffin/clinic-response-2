# Test User Credentials

All users created for testing the Clinic Queue System.

## Login URL
**Local:** http://localhost:3000/login

## Test Accounts

### 🔴 Admin
- **Email:** admin@clinic.com
- **Password:** admin123
- **Access:** Full system access, user management, audit logs, metrics
- **Dashboard:** `/admin/dashboard`

### 👨‍⚕️ Doctor
- **Email:** doctor@clinic.com
- **Password:** doctor123
- **Access:** Patient records, diagnosis, prescriptions, lab orders
- **Dashboard:** `/doctor/dashboard`

### 👩‍⚕️ Nurse
- **Email:** nurse@clinic.com
- **Password:** nurse123
- **Access:** Vital signs, patient notes, ready-for-doctor flag
- **Dashboard:** `/nurse`

### 💊 Pharmacist
- **Email:** pharmacist@clinic.com
- **Password:** pharmacist123
- **Access:** Prescription dispensing, medication tracking
- **Dashboard:** `/pharmacist/dashboard`

### 🧪 Lab Technician
- **Email:** lab@clinic.com
- **Password:** lab123
- **Access:** Lab test management, result entry
- **Dashboard:** `/lab/dashboard`

### 📋 Receptionist
- **Email:** receptionist@clinic.com
- **Password:** receptionist123
- **Access:** Appointment booking, patient registration, queue management
- **Dashboard:** `/receptionist/dashboard` or `/receptionist`

---

## Navigation Hub
Visit `/hub` after logging in to see role-specific navigation options.

## Security Notes
⚠️ **IMPORTANT:** These are development/testing credentials only!
- Change all passwords before deploying to production
- Use strong passwords (min 12 characters, mixed case, numbers, symbols)
- Enable 2FA in production environments
- Regularly rotate credentials

## Quick Links
- **Home:** http://localhost:3000/
- **Hub:** http://localhost:3000/hub
- **Book Appointment:** http://localhost:3000/book
- **Queue Status:** http://localhost:3000/status
- **Patient Portal:** http://localhost:3000/patient

---

**Generated:** December 2025
**System:** First Response Clinic Queue Management

# Nurse Clinical Dashboard - Documentation

## Overview

The Nurse Dashboard is a high-efficiency, workflow-centric clinical interface designed for busy healthcare staff who need to process patients quickly and accurately. It features real-time patient queue management, smart triage with automatic risk scoring, and comprehensive vitals tracking.

## Features

### 1. Live Patient Queue ("Waiting Room")
- **Real-time Updates**: Queue refreshes every 8 seconds
- **Status Indicators**: Visual color coding for patient status
  - **Yellow**: Waiting for vitals
  - **Blue**: In vitals (being processed)
  - **Green**: Done
- **Call Patient Button**: Changes status from "Waiting" to "In Vitals"
- **Smart Sorting**: Critical patients automatically prioritized at the top

### 2. Smart Triage Form with Automatic Risk Scoring

#### Vitals Tracked:
- **Temperature** (°C)
  - Normal: 36.5-37.5°C
  - Warning: 38-38.9°C or <35°C
  - **CRITICAL**: ≥39°C (High Fever Alert)

- **Blood Pressure** (mmHg)
  - Normal: 90-140 / 60-90
  - Warning: 140-179 / 90-119
  - **CRITICAL**: ≥180 / ≥120 (Hypertensive Crisis)

- **Pulse** (bpm)
  - Normal: 60-100
  - Warning: 100-120 or 40-60
  - **CRITICAL**: >120 or <40

- **Oxygen Saturation** (%)
  - Normal: 95-100%
  - Warning: 90-94%
  - **CRITICAL**: <90% (Hypoxia Alert)

- **Weight** (kg)
- **Height** (cm)

#### Risk Alerts:
- **Normal**: Green - No alerts
- **Warning**: Yellow badge with abnormal vitals message
- **Critical**: Red animated badge with immediate attention required

### 3. Patient Profile Drawer
Click any patient's name to open a slide-over drawer showing:
- Patient demographics (phone, email)
- Current visit reason
- Allergies and warnings
- Visit history (last 10 visits)
- Current vitals summary

### 4. Orders & Tasks Checklist
- **Add Orders**: Nurses can add tasks (e.g., "Administer Vaccine")
- **Complete Tasks**: Check off completed orders
- **Timestamped Logs**: Each completion records:
  - Who completed it (nurse name)
  - When it was completed (exact time)
- **Example**: "Vaccine given at 10:42 AM by Nurse Sarah"

### 5. Mobile/Tablet Optimization
- **Large Touch Targets**: Buttons are 48px+ for easy tapping
- **Responsive Sidebar**: Collapses on mobile, slides out on demand
- **Touch-Friendly Inputs**: Large input fields (text-base, py-3)
- **Readable Fonts**: Clear, high-contrast text throughout

## File Structure

```
app/
├── nurse/
│   └── page.tsx                    # Main clinical dashboard (ONLY nurse page)
│
└── api/
    ├── nurse/
    │   └── [id]/
    │       ├── route.ts            # PATCH vitals & readyForDoctor
    │       └── orders/
    │           └── route.ts        # POST/PATCH orders
    ├── appointment/
    │   └── [id]/
    │       └── status/
    │           └── route.ts        # PATCH appointment status
    └── patient/
        └── [id]/
            └── history/
                └── route.ts        # GET patient visit history

components/
└── nurse/
    ├── SmartTriageForm.tsx         # Vitals input with risk validation
    ├── PatientDrawer.tsx           # Patient profile slide-over
    ├── RiskAlert.tsx               # Critical/warning alert badges
    └── OrdersChecklist.tsx         # Tasks management

models/
└── Appointment.ts                  # Extended with pulse, oxygen, orders, triageRiskLevel
```

## API Endpoints

### PATCH `/api/nurse/[id]`
Update patient vitals and notify doctor.

**Request Body:**
```json
{
  "temperature": "38.5",
  "bloodPressure": "140/90",
  "pulse": "85",
  "oxygen": "97",
  "weight": "70",
  "height": "170",
  "nurseNote": "Patient reports mild headache",
  "triageRiskLevel": "warning",
  "readyForDoctor": true
}
```

### POST `/api/nurse/[id]/orders`
Add a new order/task.

**Request Body:**
```json
{
  "description": "Administer Flu Vaccine"
}
```

### PATCH `/api/nurse/[id]/orders`
Mark an order as complete/incomplete.

**Request Body:**
```json
{
  "orderId": "abc123",
  "completed": true,
  "completedBy": "Nurse Sarah"
}
```

### PATCH `/api/appointment/[id]/status`
Update appointment status.

**Request Body:**
```json
{
  "status": "in-progress"  // or "waiting", "done"
}
```

### GET `/api/patient/[id]/history`
Fetch patient's last 10 visits.

**Response:**
```json
[
  {
    "createdAt": "2025-01-15T10:30:00Z",
    "diagnosis": "Flu",
    "temperature": "38.2",
    "bloodPressure": "120/80"
  }
]
```

## Database Schema Extensions

### Appointment Model
```typescript
{
  pulse: String,
  oxygen: String,
  triageRiskLevel: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal'
  },
  orders: [{
    description: String,
    completed: { type: Boolean, default: false },
    completedBy: String,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now }
  }]
}
```

## User Workflow

### Typical Nurse Workflow:
1. **Patient Arrives**: Shows in queue as "Waiting" (yellow)
2. **Call Patient**: Nurse clicks "Call Patient" → status changes to "In Vitals" (blue)
3. **Record Vitals**: Click "Record Vitals" to open Smart Triage Form
4. **Enter Measurements**: System automatically highlights abnormal values
   - Fever >39°C? → Red alert appears
   - O2 <90%? → Critical hypoxia warning
5. **Add Clinical Notes**: Document observations
6. **Save to Chart**: Vitals saved to patient record
7. **Review Orders**: Complete any doctor-assigned tasks
8. **Notify Doctor**: Click "Notify Doctor - Patient Ready"
9. **Patient Moves to Doctor**: Status eventually changes to "Done" (green)

## Access Control

**Authorized Roles:**
- `Nurse` - Full access
- `Admin` - Full access (for oversight)

**Protected Routes:**
- All `/nurse/*` routes check `session?.user?.role`
- Redirects to `/login` if unauthorized
- Toast notification: "Access denied. Nurse role required."

## Performance Features

- **Auto-refresh**: Queue updates every 8 seconds
- **Optimistic UI**: Immediate feedback on button clicks
- **Memoized Filters**: Efficient search and sorting
- **Real-time Sorting**: Critical patients always shown first

## Mobile Optimization Checklist

- Large buttons (min 48px height)
- Touch-friendly inputs (py-3, text-base)
- Responsive sidebar (collapses on mobile)
- High contrast colors
- Clear status indicators
- Swipe-friendly drawer
- No hover-only interactions

## Color Coding System

### Status Colors:
- **Yellow** (`bg-yellow-500`): Waiting
- **Blue** (`bg-blue-500`): In Vitals
- **Green** (`bg-green-500`): Done

### Risk Colors:
- **Red** (`bg-red-500/20`): Critical vitals
- **Yellow** (`bg-yellow-500/20`): Warning vitals
- **Purple** (`bg-purple-500/20`): Ready for doctor

## Future Enhancements

Potential additions:
- [ ] Print patient vitals summary
- [ ] Export daily stats to CSV
- [ ] Voice input for vitals (hands-free)
- [ ] Barcode scanner integration for patient ID
- [ ] Real-time chat with doctors
- [ ] Medication administration tracking
- [ ] Lab results integration

## Important Notes

**Single Dashboard:** There is ONLY ONE nurse page at `/nurse` (not `/nurse/dashboard`). This eliminates confusion and provides a single entry point for all nurse functionality.

## Testing Credentials

**Nurse Login:**
- Email: `nurse@clinic.com`
- Password: (check `LOGIN-CREDENTIALS.md`)

**Access URL:** `http://localhost:3000/nurse`

## Support

For issues or questions:
- Check the main `README.md`
- Review `IMPROVEMENTS.md` for planned updates
- Report bugs via GitHub Issues

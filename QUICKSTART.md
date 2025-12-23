# Quick Start Guide

Get your Clinic Queue System running in under 5 minutes!

## Prerequisites

- Node.js 18+ or 20+
- MongoDB Atlas account (free tier works)
- npm installed

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/your-username/clinic-queue-system.git
cd clinic-queue-system

# Install dependencies
npm install
```

## Step 2: Configure Environment (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```bash
# Minimum required configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-queue
NEXTAUTH_SECRET=paste-a-32-character-random-string-here
NEXTAUTH_URL=http://localhost:3000
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any 32+ character random string
```

## Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## You're Done!

### Default Test Credentials

The system doesn't come with default users. You'll need to:

1. **Create users via MongoDB directly**, OR
2. **Use the registration flow** (if implemented), OR
3. **Insert test data manually**:

```javascript
// Connect to MongoDB and run this in MongoDB Compass or shell
db.users.insertOne({
  email: "admin@clinic.com",
  password: "$2a$10$XYZ...",  // Use bcrypt to hash "password123"
  fullName: "Admin User",
  role: "Admin"
})
```

To generate a bcrypt hash:
```bash
npm install -g bcrypt-cli
bcrypt-cli "password123" 10
```

## Optional Services Setup

### Pusher (Real-time Updates)

1. Sign up at [pusher.com](https://pusher.com/)
2. Create a new app
3. Add to `.env`:

```bash
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### Email Notifications (Gmail)

1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Add to `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourclinic.com
```

### SMS Notifications (Twilio)

1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get a phone number
3. Add to `.env`:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Common Issues

### "MongoDB connection failed"

**Solution 1:** Check your MongoDB URI
- Ensure username and password are correct
- URL-encode special characters in password

**Solution 2:** Whitelist your IP in MongoDB Atlas
1. Go to MongoDB Atlas
2. Network Access
3. Add IP Address
4. Allow access from anywhere (0.0.0.0/0) for development

### "NextAuth secret not set"

**Solution:** Generate a random 32-character string:
```bash
openssl rand -base64 32
```

Add it to `.env` as `NEXTAUTH_SECRET`

### Build errors

**Solution:** Clear cache and rebuild
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Port already in use

**Solution:** Use a different port
```bash
PORT=3001 npm run dev
```

## Next Steps

1. **Test the health endpoint**: Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)
2. **Create your first appointment**: Go to [http://localhost:3000/book](http://localhost:3000/book)
3. **Login as admin**: Use your created admin credentials
4. **Explore dashboards**: Navigate to different role dashboards
5. **Read the full documentation**: Check [README.md](README.md)

## Production Deployment

For production deployment, see:
- [Docker Deployment](README.md#docker-deployment-recommended)
- [Vercel Deployment](README.md#vercel-deployment)
- [Manual Deployment](README.md#manual-deployment)

## Need Help?

- [Full Documentation](README.md)
- [Report Issues](https://github.com/your-username/clinic-queue-system/issues)
- [Get Support](https://github.com/your-username/clinic-queue-system/discussions)

---

**Happy coding!**

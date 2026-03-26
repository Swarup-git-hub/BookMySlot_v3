# Setup & Testing Guide

## Pre-Deployment Checklist

### System Requirements
- [ ] Node.js 18+ installed
- [ ] MongoDB 5+ installed and running
- [ ] Git installed
- [ ] Docker and Docker Compose installed (for Docker deployment)
- [ ] Gmail account with app-specific password created
- [ ] At least 2GB RAM and 20GB disk space

## Step 1: Environment Setup

### 1.1 Create Backend Environment File

```bash
cd backend
cp ../.env.example .env
```

Edit `backend/.env`:
```env
# Update these with your values
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
JWT_SECRET=your-super-secret-key-min-32-chars
ADMIN_EMAIL=your-preferred-admin@gmail.com
MONGODB_URI=mongodb://127.0.0.1:27017/bookingslot
```

### 1.2 Create Frontend Environment (Optional)

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

## Step 2: MongoDB Setup

### Local MongoDB Setup
```bash
# Windows - Start MongoDB
mongod

# Mac - Start MongoDB
brew services start mongodb-community

# Linux - Start MongoDB
sudo systemctl start mongod

# Verify connection
mongosh mongodb://127.0.0.1:27017
# Type: exit
```

### Test MongoDB Connection
```javascript
// In MongoDB shell
show databases
use bookingslot
db.users.count()
```

## Step 3: Dependency Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

## Step 4: Database Initialization

### Seed Initial Data

```bash
cd backend
npm run seed
```

**Expected Output:**
```
Database connected successfully
Admin created: hemaswarupbande5@gmail.com
3 guides created
9 teams created
36 students created
7 sessions created
70 slots generated per session
Default configuration created
Seed completed successfully!
```

### Verify Seeded Data

```bash
# In MongoDB shell
mongosh mongodb://127.0.0.1:27017/bookingslot

# Check collections
show collections

# Count documents
db.users.count()                    # Should be 49 (1 admin + 3 guides + 45 students)
db.teams.count()                    # Should be 9
db.sessions.count()                 # Should be 7
db.slots.count()                    # Should be 700+ (depending on slot count)

# Sample user query
db.users.findOne({ email: "hemaswarupbande5@gmail.com" })

# Exit
exit
```

## Step 5: Start Development Servers

### Terminal 1 - Backend Server
```bash
cd backend
npm start

# Expected output:
# Backend server running on port 5000
# MongoDB connected successfully
# Socket.io server initialized
# Listening for WebSocket connections
```

### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev

# Expected output:
# VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

## Step 6: Testing Workflows

### 6.1 Authentication Flow Test

#### Test OTP Sending
```bash
# Request OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"hemaswarupbande5@gmail.com"}'

# Expected response:
# {
#   "message": "OTP sent successfully",
#   "expiresIn": "5 minutes"
# }
```

#### Test in Browser
1. Open http://localhost:5173
2. Enter email: `hemaswarupbande5@gmail.com`
3. Click "Send OTP"
4. Check email for OTP or check backend console
5. Enter OTP in verification form
6. Should redirect to Admin Dashboard

### 6.2 Admin Dashboard Tests

#### Create Session
1. Login as admin
2. Go to Sessions
3. Create new session:
   - Date: Tomorrow
   - Forenoon: 09:00 - 12:00, 4 slots
   - Afternoon: 14:00 - 17:00, 4 slots
4. Verify slots auto-generate (in database)

#### Check Stats
- Dashboard should show: Users count, sessions, requests (initially 0)
- Quick actions: Create Session, View Users, Manage Teams

#### Create User
1. Go to Users
2. Click Add User
3. Fill form with new user details
4. Assign role (Guide/Student/Admin)
5. Verify user appears in list

#### Manage Teams
1. Go to Teams
2. Create new team for a guide
3. Add students to team
4. Verify team members displayed
5. Test remove student

### 6.3 Guide Dashboard Tests

#### Login as Guide
1. Logout from admin
2. Login with guide email: `rajesh.guide@example.com`
3. Should redirect to Guide Dashboard
4. See sidebar with "My Teams" and "Pending Requests"

#### View Pending Requests
1. Have a student request a slot (see Student tests below)
2. Guide should see pending request in list
3. Click Approve - request status changes, slot status becomes "approved"
4. Click Reject - request status changes, rejection reason saved

### 6.4 Student Dashboard Tests

#### Login as Student
1. Logout
2. Use seed credential (any student email like student@example.com)
3. Should redirect to Student Dashboard

#### Book Slot
1. Select session from dropdown
2. View 2×5 grid of slots
3. Click available slot (green background)
4. Confirm booking
5. Slot status becomes "pending" (blue)
6. Notification shows "Waiting for guide approval"

#### View Booking History
1. Go to "My Bookings" tab
2. Should show previously requested slots
3. Show status: pending, approved, rejected, cancelled

### 6.5 Real-Time Updates Test

1. Open dashboard in 2 browser windows
2. Window 1: Admin disables a slot
3. Window 2: Should reflect disabled slot immediately
4. Window 1: Guide approves request
5. Window 2: Request list updates in real-time

### 6.6 Export Functionality Test

#### Export Bookings to Excel
```bash
curl http://localhost:5000/api/export/bookings/excel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o bookings.xlsx
```

Verify file:
- Headers: Date, Student Name, Email, Team, TimeSlot, Period, Status
- Data rows populated correctly
- File opens in Excel without errors

#### Export to CSV
```bash
curl http://localhost:5000/api/export/bookings/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o bookings.csv
```

Verify file:
- Headers and data match Excel export
- Can open in Excel, Google Sheets, or text editor
- Commas properly escaped

### 6.7 API Endpoint Tests

#### Health Check
```bash
# Should return 200
curl -I http://localhost:5000/api/auth/profile

# With valid token:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/auth/profile
```

#### Get Sessions
```bash
curl http://localhost:5000/api/admin/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return array of sessions
```

#### Get Available Slots
```bash
curl http://localhost:5000/api/slots/session/SESSIONID/available \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return array of available slots
```

#### Get Analytics
```bash
curl http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return stats object
```

## Step 7: Common Issues & Fixes

### Issue: "MongoDB Connection Failed"

**Solution:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod

# Check connection
mongosh mongodb://127.0.0.1:27017
```

### Issue: "OTP Not Sending"

**Solution:**
1. Verify Gmail credentials in `.env`
2. Check if app-specific password is used (not regular password)
3. Enable less secure apps or use app password from: https://myaccount.google.com/apppasswords
4. Check backend logs for SMTP errors: `grep -i "email\|smtp" backend.log`

### Issue: "Port 5000 Already in Use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### Issue: "CORS Error in Browser"

**Solution:**
1. Check that `CORS_ORIGIN` in .env includes your frontend URL
2. Verify frontend is running on http://localhost:5173
3. Check backend console for CORS errors
4. Restart backend after env changes

### Issue: "Seed Script Errors"

**Solution:**
```bash
# Clear database and reseed
mongosh mongodb://127.0.0.1:27017/bookingslot

# In MongoDB shell:
db.users.deleteMany({})
db.teams.deleteMany({})
db.sessions.deleteMany({})
db.slots.deleteMany({})
db.requests.deleteMany({})
db.configs.deleteMany({})
exit

# Reseed
cd backend
npm run seed
```

### Issue: "JWT Token Invalid"

**Solution:**
1. Clear browser sessionStorage: Open Dev Tools → Application → SessionStorage → Clear
2. Logout and login again
3. Verify JWT_SECRET hasn't changed
4. Check token expiry (default 7 days)

## Step 8: Performance Testing

### Load Testing - OTP Endpoint
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 -p payload.json \
  -T application/json \
  http://localhost:5000/api/auth/send-otp

# -n 100: 100 requests total
# -c 10: 10 concurrent requests
```

### Database Query Performance
```javascript
// In MongoDB shell
db.slots.find({ session: ObjectId("..."), status: "available" }).count()
db.requests.find({ status: "pending" }).sort({ createdAt: -1 }).limit(100)

// Check if indexes are being used
db.slots.find({ status: "available" }).explain("executionStats")
```

### Memory Usage Check
```bash
# Backend
node --max-old-space-size=2048 src/server.js

# Frontend (Vite)
npm run build
npm run preview
```

## Step 9: Security Testing

### Test Authentication
```bash
# Without token - should fail
curl -H "Authorization: Bearer invalid" \
  http://localhost:5000/api/auth/profile

# Expected: 401 Unauthorized

# With expired token - should fail
# Delete token from browser and try to make request
```

### Test Authorization
```bash
# Student trying to create session (admin only)
curl -X POST http://localhost:5000/api/admin/sessions \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15"}'

# Expected: 403 Forbidden
```

### Test Rate Limiting
```bash
# Send 10 OTP requests rapidly
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo "Request $i sent"
done

# 6th request onwards should fail with 429 Too Many Requests
```

## Step 10: Docker Deployment Test

### Build Docker Image
```bash
docker build -t reviewslot:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d

# Check services
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test app
curl http://localhost/api/auth/profile
```

### Cleanup Docker
```bash
docker-compose down -v  # Remove volumes
docker system prune -a  # Remove all unused images
```

## Step 11: Production Readiness Checklist

- [ ] All sensitive data in environment variables
- [ ] Database backups configured
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting implemented on sensitive endpoints
- [ ] Request logging enabled
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Health check endpoints verified
- [ ] Database indexes created
- [ ] CORS properly configured
- [ ] Security headers configured in nginx
- [ ] Docker image built and tested
- [ ] docker-compose.yml configured for production
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure documented

## Step 12: Startup Verification

After completing all setup steps:

### Checklist
- [ ] Backend starts without errors and connects to MongoDB
- [ ] Frontend builds and loads at http://localhost:5173
- [ ] Can login with seeded admin account
- [ ] OTP email sends successfully
- [ ] Can create session as admin
- [ ] Can view requests as guide
- [ ] Can request slot as student
- [ ] Real-time updates work (test with 2 browsers)
- [ ] Can export data to Excel/CSV
- [ ] API endpoints return correct responses
- [ ] Dashboard displays statistics
- [ ] No console errors in browser
- [ ] No errors in backend logs

## Deployment Commands Quick Reference

### Development
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm run dev
```

### Production (Docker)
```bash
# Setup
cp .env.example backend/.env
# Edit backend/.env with production values

# Deploy
docker-compose up -d

# Initialize
docker exec reviewslot_backend npm run seed

# View logs
docker-compose logs -f

# Cleanup
docker-compose down
```

### Backup
```bash
# MongoDB backup
docker exec reviewslot_mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Restore
docker exec reviewslot_mongodb mongorestore /backup/backup_20240115_120000
```

## Support & Debugging

### Check Backend Logs
```bash
# Development
npm start -- --debug

# Docker
docker logs -f reviewslot_backend

# Search for errors
docker logs reviewslot_backend | grep -i error
```

### Check Database
```bash
mongosh mongodb://127.0.0.1:27017/bookingslot

# View all collections
show collections

# Check indexes
db.users.getIndexes()
db.requests.getIndexes()

# Find specific user
db.users.findOne({ email: "hemaswarupbande5@gmail.com" })

# Check stats
db.stats()
```

### Test Email Service
```bash
# Check if Gmail credentials work
node -e "
require('nodemailer').createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
}).verify((err, success) => {
  console.log(err || 'SMTP connection successful: ' + success);
});
"
```

## Next Steps

After successful testing:

1. **Deploy to Production**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Configure SSL**: Set up Let's Encrypt for HTTPS
3. **Setup Monitoring**: Configure application monitoring and alerting
4. **Create Backups**: Automate MongoDB backups
5. **Optimize Performance**: Configure caching, CDN, database optimization
6. **Security Hardening**: Implement additional security measures as needed

---

**For issues or questions, refer to DEPLOYMENT.md or check logs for detailed error messages.**

# Quick Start: Admin Panel Setup

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB running locally
- Environment variables configured

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Seed initial data
npm run seed

# Start server
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5174
```

### 3. Access Admin Panel

1. Open http://localhost:5174 in your browser
2. Login with admin email (check .env for ADMIN_EMAIL)
3. Navigate to Admin Dashboard

---

## 📝 Step-by-Step: Creating Your First Users

### Scenario: Setup with 2 guides, 2 teams, 8 students

#### Step 1: Create Guides (2 total)

**Guide 1:**
```
Name: Dr. Alice Smith
Email: alice.smith@example.com
Role: Guide
```

**Guide 2:**
```
Name: Dr. Bob Johnson
Email: bob.johnson@example.com
Role: Guide
```

#### Step 2: Create Teams (2 total)

**Team A:**
```
Team Name: Team A
Guide: Dr. Alice Smith
Max Members: 5
```

**Team B:**
```
Team Name: Team B
Guide: Dr. Bob Johnson
Max Members: 5
```

#### Step 3: Create Students (8 total)

**Students for Team A (4):**
```
1. John Doe - john@example.com
2. Jane Smith - jane@example.com
3. Mike Wilson - mike@example.com
4. Sarah Davis - sarah@example.com
[All assigned to Team A]
```

**Students for Team B (4):**
```
1. Alex Brown - alex@example.com
2. Emily White - emily@example.com
3. Chris Green - chris@example.com
4. Lisa Black - lisa@example.com
[All assigned to Team B]
```

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] Both guides login successfully
- [ ] Each guide sees their team in dashboard
- [ ] Students login and see their team
- [ ] Guides can view their team members
- [ ] Admin can see all users and teams
- [ ] Adding student shows real-time update
- [ ] Removing student updates count

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process or use different port
```

### Frontend won't connect to backend
```bash
# Verify backend is running
curl http://localhost:5000/

# Check VITE_API_URL in .env
# Should be http://localhost:5000
```

### Can't create users
```bash
# Check browser console for errors
# Verify JWT token exists in localStorage
# Ensure you're logged in as admin
```

### Users not showing in list
```bash
# Refresh the page (F5)
# Check MongoDB connection
# Verify users were actually created (check DB)
```

---

## 📊 Expected Output

After completing all steps, you should see:

**Admin Panel - Users:**
- 1 Admin user
- 2 Guide users
- 8 Student users

**Admin Panel - Teams:**
- 2 Teams
- Team A: 4 students
- Team B: 4 students

**Guides Dashboard:**
- Can see their assigned teams
- Can see their team members
- Can manage bookings/slots

**Students Dashboard:**
- Can see their team
- Can see guide's contact
- Can book available slots

---

## 🔄 Common Operations

### Add Student to Existing Team
1. Users Management → Add User
2. Create student with desired team
3. Go to Teams Management
4. Verify student appears in team

### Move Student to Different Team
1. Users Management → Edit User
2. Cannot change team (by design - prevents conflicts)
3. Alternative: Create new student account with correct team

### Increase Team Capacity
1. Teams Management → Edit Team
2. Change Max Members value
3. Can now add more students

### View All Teams of a Guide
1. Go to Teams Management
2. Teams are listed with guide name
3. Filter or search for guide name

---

## 🎓 Role Permissions

### Admin
- Create/Edit/Delete users
- Create/Edit/Delete teams
- View all users and teams
- Access admin panel

### Guide
- Login and view profile
- See assigned teams
- See team members
- Manage slot bookings

### Student
- Login and view profile
- See assigned team
- View team guide info
- Book available slots

---

## 📞 API Reference

### User Creation
```
Method: POST
URL: /api/auth/users
Body: {
  "name": "string",
  "email": "string",
  "role": "student|guide|admin",
  "team": "teamId (required for students)"
}
```

### Team Creation
```
Method: POST
URL: /api/teams
Body: {
  "name": "string",
  "guideId": "userId",
  "maxMembers": "number"
}
```

### Add Student to Team
```
Method: POST
URL: /api/teams/:teamId/add-student
Body: {
  "studentId": "userId"
}
```

---

**Status:** Ready for testing
**Backend:** ✅ Running on port 5000
**Frontend:** ✅ Running on port 5174
**Database:** ✅ MongoDB connection configured

# API Documentation

## Base URL
```
http://localhost:5000/api
http://your-domain.com/api (Production)
```

## Authentication
All endpoints (except public ones) require JWT token in `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format
All responses are JSON:
```json
{
  "data": {},
  "message": "Success message",
  "error": "Error message (if applicable)"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Server Error

---

## Authentication Endpoints

### Send OTP
Generate and send OTP to email address.

**Endpoint:** `POST /auth/send-otp`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": "5 minutes",
  "email": "user@example.com"
}
```

**Error Responses:**
- `429` - OTP request limit exceeded (max 5 per user)
- `429` - Rate limited (must wait 60 seconds between requests)
- `400` - Invalid email format

---

### Verify OTP
Verify OTP and receive JWT token.

**Endpoint:** `POST /auth/verify-otp`

**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "604800 (7 days)",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "team": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Team A"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid OTP format (must be 6 digits)
- `401` - Invalid OTP or expired
- `404` - Email not found
- `401` - OTP expired (5 minutes)

---

### Get Current User Profile
Retrieve authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required (Any role)

**Request Parameters:** None

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "isActive": true,
    "team": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Team A",
      "guide": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Guide Name"
      }
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Logout
Invalidate current session token.

**Endpoint:** `POST /auth/logout`

**Authentication:** Required (Any role)

**Request Body:** None

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## User Management Endpoints (Admin Only)

### Create User
Create a new user account.

**Endpoint:** `POST /auth/users`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "student",
  "team": "507f1f77bcf86cd799439012"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "student"
  }
}
```

**Error Responses:**
- `400` - Email already exists
- `403` - Only admin can create users

---

### Get All Users
List all users with optional filtering.

**Endpoint:** `GET /auth/users`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `limit=50` - Results per page (default: 50, max: 100)
- `skip=0` - Skip results
- `role=student` - Filter by role (student|guide|admin)
- `search=john` - Search by name or email

**Response (200):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "team": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 45,
  "limit": 50,
  "skip": 0
}
```

---

### Delete User
Soft delete (disable) a user account.

**Endpoint:** `DELETE /auth/users/:userId`

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "message": "User deleted successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": false
  }
}
```

---

## Slot Endpoints

### Generate Slots
Auto-generate slots for a session based on session configuration.

**Endpoint:** `POST /slots/generate`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "sessionId": "507f1f77bcf86cd799439015"
}
```

**Response (201):**
```json
{
  "message": "Slots generated successfully",
  "slotsCreated": 10,
  "slots": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "session": "507f1f77bcf86cd799439015",
      "period": "forenoon",
      "slotNumber": 1,
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "available"
    }
  ]
}
```

---

### Get Slots by Session
Retrieve all slots for a specific session.

**Endpoint:** `GET /slots/session/:sessionId`

**Authentication:** Required (Any role)

**Query Parameters:**
- `period=forenoon` - Filter by period (forenoon|afternoon)

**Response (200):**
```json
{
  "slots": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "session": {
        "_id": "507f1f77bcf86cd799439015",
        "date": "2024-01-20"
      },
      "period": "forenoon",
      "slotNumber": 1,
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "available",
      "bookingStatus": {
        "team": null,
        "approvedAt": null
      },
      "isDisabled": false,
      "request": null
    }
  ],
  "total": 10
}
```

---

### Get Available Slots
Retrieve only available slots for booking.

**Endpoint:** `GET /slots/session/:sessionId/available`

**Authentication:** Required (Any role)

**Response (200):**
```json
{
  "availableSlots": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "startTime": "09:00",
      "endTime": "09:30",
      "period": "forenoon"
    }
  ],
  "total": 4
}
```

---

### Get Booking Summary
Get overview of slot bookings for a session.

**Endpoint:** `GET /slots/session/:sessionId/summary`

**Authentication:** Required (Any role)

**Response (200):**
```json
{
  "sessionId": "507f1f77bcf86cd799439015",
  "date": "2024-01-20",
  "summary": {
    "total": 10,
    "available": 4,
    "pending": 3,
    "approved": 2,
    "disabled": 1,
    "utilization": "60%"
  },
  "byPeriod": {
    "forenoon": {
      "total": 5,
      "available": 2,
      "pending": 2,
      "approved": 1
    },
    "afternoon": {
      "total": 5,
      "available": 2,
      "pending": 1,
      "approved": 1,
      "disabled": 1
    }
  }
}
```

---

### Request Slot
Submit a slot booking request (student).

**Endpoint:** `POST /slots/request`

**Authentication:** Required (Student only)

**Request Body:**
```json
{
  "slotId": "507f1f77bcf86cd799439016"
}
```

**Response (201):**
```json
{
  "message": "Slot requested successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439017",
    "student": "507f1f77bcf86cd799439011",
    "team": "507f1f77bcf86cd799439012",
    "slot": "507f1f77bcf86cd799439016",
    "session": "507f1f77bcf86cd799439015",
    "status": "pending",
    "createdAt": "2024-01-15T14:20:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Slot not available
- `400` - Your team has already requested this session
- `400` - You must be in a team to request slots
- `403` - Student only

---

### Toggle Slot Status
Enable or disable a slot (admin only).

**Endpoint:** `PUT /slots/:slotId/toggle`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "isDisabled": true,
  "reason": "Maintenance scheduled"
}
```

**Response (200):**
```json
{
  "message": "Slot updated successfully",
  "slot": {
    "_id": "507f1f77bcf86cd799439016",
    "isDisabled": true,
    "disableReason": "Maintenance scheduled",
    "status": "disabled"
  }
}
```

---

## Request Management Endpoints

### Get Guide's Pending Requests
Retrieve all pending requests for guide's teams.

**Endpoint:** `GET /requests/guide/all`

**Authentication:** Required (Guide only)

**Query Parameters:**
- `status=pending` - Filter by status
- `limit=50` - Results per page
- `skip=0` - Skip results

**Response (200):**
```json
{
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "student": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Student Name",
        "email": "student@example.com"
      },
      "team": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Team A"
      },
      "slot": {
        "_id": "507f1f77bcf86cd799439016",
        "startTime": "09:00",
        "endTime": "09:30",
        "period": "forenoon"
      },
      "session": {
        "_id": "507f1f77bcf86cd799439015",
        "date": "2024-01-20"
      },
      "status": "pending",
      "createdAt": "2024-01-15T14:20:00.000Z"
    }
  ],
  "total": 3
}
```

---

### Approve Request
Approve a slot request (guide only). Auto-rejects competing requests.

**Endpoint:** `POST /requests/:requestId/approve`

**Authentication:** Required (Guide only)

**Response (200):**
```json
{
  "message": "Request approved successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439017",
    "status": "approved",
    "approvedBy": "507f1f77bcf86cd799439020",
    "approvalDate": "2024-01-15T15:00:00.000Z"
  },
  "otherRequestsRejected": 2,
  "rejectionReason": "Another team's request was approved for this slot"
}
```

---

### Reject Request
Reject a slot request (guide only).

**Endpoint:** `POST /requests/:requestId/reject`

**Authentication:** Required (Guide only)

**Request Body:**
```json
{
  "reason": "Time not convenient"
}
```

**Response (200):**
```json
{
  "message": "Request rejected successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439017",
    "status": "rejected",
    "rejectionReason": "Time not convenient"
  }
}
```

---

### Cancel Request
Cancel a pending request (student only).

**Endpoint:** `POST /requests/:requestId/cancel`

**Authentication:** Required (Student only)

**Request Body:**
```json
{
  "reason": "Cannot attend"
}
```

**Response (200):**
```json
{
  "message": "Request cancelled successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439017",
    "status": "cancelled",
    "cancelledBy": "507f1f77bcf86cd799439011",
    "cancellationReason": "Cannot attend"
  }
}
```

---

### Get Student's Bookings
View all booking requests for logged-in student.

**Endpoint:** `GET /requests/my-bookings`

**Authentication:** Required (Student only)

**Response (200):**
```json
{
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "slot": {
        "_id": "507f1f77bcf86cd799439016",
        "startTime": "09:00",
        "endTime": "09:30"
      },
      "session": {
        "_id": "507f1f77bcf86cd799439015",
        "date": "2024-01-20"
      },
      "status": "approved",
      "createdAt": "2024-01-15T14:20:00.000Z",
      "approvalDate": "2024-01-15T15:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

## Team Endpoints

### Get All Teams
List all teams (admin) or get guide's teams (guide).

**Endpoint:** `GET /teams`

**Authentication:** Required (Admin for all, Guide for their own)

**Query Parameters:**
- `groupBy=guide` - Group by guide
- `limit=50` - Results per page

**Response (200):**
```json
{
  "teams": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Team A",
      "guide": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Guide Name"
      },
      "members": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Student 1",
          "email": "student1@example.com"
        }
      ],
      "maxMembers": 4,
      "isActive": true
    }
  ],
  "total": 9
}
```

---

### Create Team
Create a new student team (admin only).

**Endpoint:** `POST /teams`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "New Team",
  "guide": "507f1f77bcf86cd799439020",
  "maxMembers": 4,
  "description": "Team description"
}
```

**Response (201):**
```json
{
  "message": "Team created successfully",
  "team": {
    "_id": "507f1f77bcf86cd799439025",
    "name": "New Team",
    "guide": "507f1f77bcf86cd799439020",
    "maxMembers": 4
  }
}
```

---

### Add Student to Team
Add student to a team (admin only).

**Endpoint:** `POST /teams/:teamId/members`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439011"
}
```

**Response (200):**
```json
{
  "message": "Student added to team",
  "team": {
    "_id": "507f1f77bcf86cd799439025",
    "members": [
      { "_id": "507f1f77bcf86cd799439011", "name": "Student 1" },
      { "_id": "507f1f77bcf86cd799439026", "name": "Student 2" }
    ]
  }
}
```

---

### Remove Student from Team
Remove student from team (admin only).

**Endpoint:** `DELETE /teams/:teamId/members/:studentId`

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "message": "Student removed from team",
  "team": {
    "_id": "507f1f77bcf86cd799439025",
    "members": [
      { "_id": "507f1f77bcf86cd799439026", "name": "Student 2" }
    ]
  }
}
```

---

## Admin Endpoints

### Create Session
Create a new review session.

**Endpoint:** `POST /admin/sessions`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "date": "2024-01-20",
  "configuration": {
    "forenoon": {
      "startTime": "09:00",
      "endTime": "12:00",
      "slotCount": 4
    },
    "afternoon": {
      "startTime": "14:00",
      "endTime": "17:00",
      "slotCount": 4
    }
  }
}
```

**Response (201):**
```json
{
  "message": "Session created successfully",
  "session": {
    "_id": "507f1f77bcf86cd799439015",
    "date": "2024-01-20",
    "configuration": { ... },
    "status": "scheduled",
    "totalSlots": 8
  }
}
```

---

### Get All Sessions
List all review sessions with filtering.

**Endpoint:** `GET /admin/sessions`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `status=scheduled` - Filter by status (scheduled|ongoing|completed|cancelled)
- `startDate=2024-01-01` - Filter from date
- `endDate=2024-01-31` - Filter to date
- `limit=50` - Results per page

**Response (200):**
```json
{
  "sessions": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "date": "2024-01-20",
      "status": "scheduled",
      "totalSlots": 8,
      "slotsGenerated": true,
      "configuration": { ... }
    }
  ],
  "total": 7
}
```

---

### Update Session
Update session configuration or status.

**Endpoint:** `PUT /admin/sessions/:sessionId`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "ongoing",
  "configuration": {
    "forenoon": {
      "startTime": "09:00",
      "endTime": "12:00",
      "slotCount": 5
    }
  }
}
```

**Response (200):**
```json
{
  "message": "Session updated successfully",
  "session": { ... }
}
```

---

### Delete Session
Delete a session and cascade delete related slots and requests.

**Endpoint:** `DELETE /admin/sessions/:sessionId`

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "message": "Session deleted successfully",
  "deleted": {
    "sessions": 1,
    "slots": 10,
    "requests": 5
  }
}
```

---

### Get Dashboard Statistics
Get system-wide statistics for dashboard.

**Endpoint:** `GET /admin/dashboard/stats`

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "stats": {
    "users": {
      "total": 49,
      "students": 45,
      "guides": 3,
      "admins": 1,
      "active": 48
    },
    "sessions": {
      "total": 7,
      "scheduled": 5,
      "ongoing": 1,
      "completed": 1
    },
    "requests": {
      "total": 25,
      "pending": 8,
      "approved": 15,
      "rejected": 2
    },
    "slots": {
      "total": 70,
      "available": 20,
      "booked": 35,
      "disabled": 15,
      "utilization": "50%"
    },
    "teams": {
      "total": 9,
      "avgMembers": 4
    },
    "approvalRate": "86%"
  }
}
```

---

## Configuration Endpoints

### Get System Configuration
Retrieve system-wide settings.

**Endpoint:** `GET /admin/config`

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "config": {
    "_id": "507f1f77bcf86cd799439030",
    "configName": "default",
    "session": {
      "forenoon": { "startTime": "09:00", "endTime": "12:00", "slotCount": 4 },
      "afternoon": { "startTime": "14:00", "endTime": "17:00", "slotCount": 4 }
    },
    "slotDuration": 30,
    "team": { "minStudents": 1, "maxStudents": 5 },
    "otp": {
      "expiryMinutes": 5,
      "maxRequests": 5
    },
    "features": {
      "realTimeUpdates": true,
      "analytics": true,
      "export": true
    }
  }
}
```

---

### Update Configuration
Update any system configuration.

**Endpoint:** `PUT /admin/config`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "slotDuration": 45,
  "team": { "maxStudents": 6 },
  "otp": { "expiryMinutes": 10 }
}
```

**Response (200):**
```json
{
  "message": "Configuration updated successfully",
  "config": { ... }
}
```

---

## Analytics Endpoints

### Get Analytics Summary
High-level analytics overview.

**Endpoint:** `GET /analytics/summary`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `startDate=2024-01-01` - From date
- `endDate=2024-01-31` - To date

**Response (200):**
```json
{
  "summary": {
    "totalSessions": 7,
    "totalRequests": 25,
    "totalApprovals": 15,
    "approvalRate": "60%",
    "slotUtilization": "50%",
    "activeTeams": 9,
    "activeUsers": 48
  },
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "days": 31
  }
}
```

---

### Get Booking Trend
Daily booking trends over time period.

**Endpoint:** `GET /analytics/booking-trend`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `days=30` - Number of days to analyze

**Response (200):**
```json
{
  "trend": [
    {
      "date": "2024-01-15",
      "total": 5,
      "approved": 3,
      "pending": 2,
      "rejected": 0
    }
  ]
}
```

---

### Get Team Performance
Performance metrics for all teams.

**Endpoint:** `GET /analytics/team-performance`

**Authentication:** Required (Admin only)

**Response (200):**
```json
{
  "teams": [
    {
      "teamId": "507f1f77bcf86cd799439012",
      "teamName": "Team A",
      "guideName": "Guide Name",
      "memberCount": 4,
      "totalRequests": 5,
      "approvedRequests": 4,
      "approvalRate": "80%"
    }
  ]
}
```

---

## Export Endpoints

### Export Bookings to Excel
Export booking data in Excel format (.xlsx).

**Endpoint:** `GET /export/bookings/excel`

**Authentication:** Required (Admin)

**Query Parameters:**
- `startDate=2024-01-01` - Filter from date
- `endDate=2024-01-31` - Filter to date
- `status=approved` - Filter by status

**Response:** File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**File Structure:**
- Headers: Date, Student Name, Email, Team, TimeSlot, Period, Status, RequestDate, ApprovalDate
- Formatted columns with auto-width
- Color-coded status

---

### Export Bookings to CSV
Export booking data in CSV format.

**Endpoint:** `GET /export/bookings/csv`

**Authentication:** Required (Admin)

**Response:** File download (text/csv)

---

### Export Session Slots to Excel
Export slot details for a specific session.

**Endpoint:** `GET /export/sessions/:sessionId/excel`

**Authentication:** Required (Admin)

**Response:** File download with columns: Date, Period, SlotNumber, TimeSlot, Status, BookedBy, Disabled

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "No token provided",
  "message": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "error": "Access denied",
  "message": "Admin role required"
}
```

**429 Too Many Requests**
```json
{
  "error": "Rate limit exceeded",
  "message": "Please wait 60 seconds before trying again"
}
```

**500 Server Error**
```json
{
  "error": "Internal server error",
  "message": "Something went wrong. Please try again later."
}
```

---

## Rate Limiting

- **OTP Endpoint**: 5 requests per user, 1 request per minute
- **Login Endpoint**: 10 attempts per hour per IP
- **Export Endpoint**: 20 requests per hour per user
- **Other Endpoints**: 100 requests per minute per user

---

## WebSocket Events (Socket.io)

### Client Events
- `user-join` - User comes online
- `user-leave` - User goes offline

### Server Events
- `slot-updated` - Slot status changed
- `request-approved` - Your booking approved
- `request-rejected` - Your booking rejected
- `slot-disabled` - Slot become unavailable
- `users-online` - List of online users

---

## Testing with cURL

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

### Get Profile
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/profile
```

### Get Sessions
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/sessions
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit=50` - Items per page (default: 50, max: 100)
- `skip=0` - Skip items (for offsetting)

**Response:**
```json
{
  "data": [...],
  "total": 200,
  "limit": 50,
  "skip": 0,
  "hasMore": true
}
```

---

## Sorting

List endpoints support sorting:

**Query Parameter:**
- `sort=-createdAt` - Descending by createdAt
- `sort=name` - Ascending by name

---

## Filtering

Use query parameters for filtering:

```bash
# Example: Get approved requests
curl "http://localhost:5000/api/requests?status=approved&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

---

## Version History

### v1.0.0
- Initial API release
- Complete CRUD for all resources
- Real-time WebSocket support
- Excel/CSV export
- Rate limiting
- Role-based access control

---

For additional documentation and examples, visit the [project repository](https://github.com/your-repo).

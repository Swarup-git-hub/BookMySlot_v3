# Review Slot Booking System - Deployment Guide

## Prerequisites

- Docker and Docker Compose installed ([Download](https://docs.docker.com/get-docker/))
- Git installed
- 2GB RAM minimum for development, 4GB+ for production
- Port 80, 443, 5000, 5173 available

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd BookMySlot_v3

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

### 2. Environment Configuration

```bash
# Create backend .env from template
cp .env.example backend/.env

# Edit backend/.env with your Gmail and other settings
# Required: GMAIL_USER, GMAIL_APP_PASSWORD
```

### 3. Start MongoDB (Local)

```bash
# Make sure MongoDB is installed and running
# On Windows:
mongod

# On Mac:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

### 4. Seed Initial Data

```bash
cd backend
npm run seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Access at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

## Docker Deployment

### Quick Start with Docker Compose

```bash
# 1. Prepare environment
cp .env.example backend/.env
# Edit backend/.env with production values

# 2. Build and start all services
docker-compose up -d

# 3. Initialize database
docker exec reviewslot_backend npm run seed

# 4. Access application
# Open http://localhost in your browser
```

### Services Included

- **MongoDB**: Port 27017 (internal only)
- **Backend (Node.js)**: Port 5000 (internal) → Port 80/443 via Nginx
- **Nginx Reverse Proxy**: Port 80 (HTTP) and 443 (HTTPS)

### Managing Docker Services

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Remove volumes (WARNING: loses data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Scale backend (if using swarm)
docker-compose up -d --scale backend=3
```

## Production Deployment

### 1. Server Requirements

- VPS/Cloud Instance (AWS EC2, DigitalOcean, Linode, etc.)
- Ubuntu 20.04+ or similar Linux
- 2GB+ RAM
- 20GB+ Disk space
- Static IP address
- Domain name

### 2. SSL Certificate Setup

```bash
# Using Let's Encrypt (recommended)
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf with certificate paths
# ssl_certificate: /etc/letsencrypt/live/your-domain.com/fullchain.pem
# ssl_certificate_key: /etc/letsencrypt/live/your-domain.com/privkey.pem

# Enable HTTPS in docker-compose.yml and nginx.conf
```

### 3. Production Environment

```bash
# Create production .env in backend/.env
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/bookingslot
JWT_SECRET=$(openssl rand -hex 32)  # Generate strong secret
GMAIL_USER=your-production-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
EOF
```

### 4. Deploy with Docker Compose

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Clone repository
git clone <your-repo-url>
cd BookMySlot_v3

# Copy environment file
cp .env.example backend/.env
# Edit backend/.env with production values

# Start services
docker-compose up -d

# Check if everything is running
docker ps

# Check logs
docker-compose logs -f

# Seed initial admin user
docker exec reviewslot_backend npm run seed
```

### 5. Backup Strategy

```bash
# Daily backup of MongoDB
docker exec reviewslot_mongodb mongodump --out /data/db/dumps/$(date +%Y%m%d_%H%M%S)

# Automated backup script
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR
docker exec reviewslot_mongodb mongodump --out $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)
# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /home/ubuntu/backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /home/ubuntu/backup.sh
```

### 6. Monitoring and Maintenance

```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# Update images
docker-compose pull
docker-compose up -d

# Cleanup old images
docker image prune -a

# Manage logs
docker-compose logs --tail=100 -f backend
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Slots
- `POST /api/slots/generate` - Generate slots for session (admin)
- `GET /api/slots/session/:id` - Get all slots by session
- `GET /api/slots/session/:id/available` - Get available slots
- `POST /api/slots/request` - Request a slot (student)
- `POST /api/slots/:id/toggle` - Enable/disable slot (admin)

### Requests
- `GET /api/requests/guide/all` - Get guide's pending requests
- `POST /api/requests/:id/approve` - Approve request (guide)
- `POST /api/requests/:id/reject` - Reject request (guide)
- `POST /api/requests/:id/cancel` - Cancel request (student)
- `GET /api/requests/my-bookings` - Get student's bookings

### Teams
- `GET /api/teams` - List all teams (admin)
- `POST /api/teams` - Create team (admin)
- `GET /api/teams/guide/all` - Get guide's teams
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Admin
- `POST /api/admin/sessions` - Create session
- `GET /api/admin/sessions` - List sessions
- `PUT /api/admin/sessions/:id` - Update session
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/config` - Get system config
- `PUT /api/admin/config` - Update system config

### Analytics
- `GET /api/analytics/summary` - Summary statistics
- `GET /api/analytics/team-performance` - Team analytics
- `GET /api/analytics/booking-trend` - Booking trends
- `GET /api/analytics/guide-performance` - Guide performance

### Export
- `GET /api/export/bookings/excel` - Export bookings to Excel
- `GET /api/export/bookings/csv` - Export bookings to CSV
- `GET /api/export/sessions/:id/excel` - Export session slots

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# View MongoDB logs
docker logs reviewslot_mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Backend Not Starting
```bash
# Check logs
docker logs reviewslot_backend

# Verify environment variables
docker exec reviewslot_backend env | grep -E "MONGODB|JWT|GMAIL"
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :80

# Kill process (use with caution)
kill -9 <PID>
```

### Gmail OTP Not Sending
```bash
# Verify SMTP credentials are correct in .env
# Ensure "Less secure app access" is enabled in Gmail (if not using app password)
# Check backend logs for email errors
docker logs reviewslot_backend | grep -i email
```

## Security Checklist

- [ ] Change default JWT_SECRET to a strong random value
- [ ] Set up HTTPS/SSL certificates
- [ ] Update CORS_ORIGIN to your domain
- [ ] Enable firewall rules (only allow necessary ports)
- [ ] Set database backups to automated daily schedule
- [ ] Configure rate limiting for sensitive endpoints
- [ ] Enable MongoDB authentication in production
- [ ] Use environment variables for all secrets
- [ ] Keep Docker images updated
- [ ] Set up monitoring and alerting
- [ ] Implement request logging and audit trails

## Support and Documentation

- API Documentation: http://your-domain.com/api/docs
- Backend Logs: `docker logs reviewslot_backend`
- Database Logs: `docker logs reviewslot_mongodb`
- Email Test: Use admin panel to send test OTP email

## Deployment on Popular Platforms

### AWS EC2
1. Launch Ubuntu 20.04 instance
2. Install Docker: `curl -fsSL https://get.docker.com | bash`
3. Clone repo and run `docker-compose up -d`
4. Set up security groups to allow ports 80, 443
5. Configure Route53 for domain

### DigitalOcean App Platform
1. Connect repository
2. Create Node.js app with Dockerfile
3. Add MongoDB service
4. Set environment variables
5. Deploy and access via provided domain

### Heroku (Limited - MongoDB not included)
1. `heroku create your-app-name`
2. Add MongoDB Atlas addon
3. Deploy with `git push heroku main`
4. Set environment variables: `heroku config:set JWT_SECRET=...`

## Performance Optimization

- Enable gzip compression in nginx.conf (already configured)
- Set up CDN for static assets
- Configure caching headers for frontend files
- Use MongoDB indexing for frequent queries
- Set up database connection pooling
- Monitor and optimize slow queries
- Implement request rate limiting
- Use load balancing for scalability

## Rollback Procedure

```bash
# Tag current production image
docker tag reviewslot_backend:current reviewslot_backend:backup_20240101

# Revert to previous version
docker-compose down
docker pull <previous-image-digest>
docker-compose up -d

# Restore database from backup if needed
docker exec reviewslot_mongodb mongorestore /data/db/dumps/backup_20240101
```

---

For additional support, contact: support@reviewslot.com

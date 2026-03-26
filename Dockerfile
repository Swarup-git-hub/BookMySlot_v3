# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend ./backend

# Copy frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies for backend only
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY backend ./backend

# Copy built frontend
COPY --from=builder /app/frontend/dist ./backend/public

EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "backend/src/server.js"]

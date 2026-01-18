# Touvel Deployment Guide

This guide provides comprehensive instructions for deploying the Touvel travel booking application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Docker Deployment](#docker-deployment)

## Prerequisites

- Node.js (v14 or higher)
- MySQL 8.0 or higher
- npm or yarn
- Docker (for containerized deployment)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kylec1114/Touvel.git
cd Touvel
```

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

## Database Setup

### 1. Create MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE touvel_db;
USE touvel_db;
```

### 2. Run Migration Scripts

```bash
mysql -u root -p touvel_db < database/schema.sql
```

## Environment Configuration

### Backend Configuration

Create `.env` file in the backend directory:

```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=touvel_db
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
```

### Frontend Configuration

Create `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## Running the Application

### Development Mode

#### Terminal 1 - Backend

```bash
cd backend
npm start
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Production Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- MySQL database
- Backend API service
- Frontend React service
- Redis cache (optional)

### Manual Production Setup

#### 1. Build Frontend

```bash
cd frontend
npm run build
```

#### 2. Start Backend with PM2

```bash
cd backend
npm install -g pm2
pm2 start server.js --name "touvel-api"
pm2 save
pm2 startup
```

#### 3. Configure Nginx (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get destination details
- `GET /api/destinations/search/:query` - Search destinations

### Bookings
- `GET /api/bookings/user/:userId` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:bookingId` - Get booking details
- `PATCH /api/bookings/:bookingId` - Update booking
- `DELETE /api/bookings/:bookingId` - Cancel booking

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use

```bash
# Find process using port
lsof -i :3001
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Environment Variables Not Loading

- Check `.env` file is in correct directory
- Restart the application
- Clear node_modules and reinstall

## Monitoring

Monitor application health:

```bash
# View PM2 logs
pm2 logs

# Monitor in real-time
pm2 monit
```

## Support

For issues or questions, please create an issue on GitHub: https://github.com/kylec1114/Touvel/issues

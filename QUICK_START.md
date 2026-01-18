# 🚀 Touvel - Quick Start Guide (5 Minutes Setup)

## ⚡ Ultra-Fast Setup - Get Running Immediately!

This guide will have your Touvel travel planning app up and running in **5 minutes**.

## 📋 Prerequisites (必要)
- Node.js 16+ (Download from https://nodejs.org/)
- MySQL 8.0+ or use online MySQL
- Git

## 🎯 Step 1: Clone the Repository (1 min)
```bash
git clone https://github.com/kylec1114/Touvel.git
cd Touvel
```

## 🗄️ Step 2: Set Up Database (1 min)

### Option A: Local MySQL
```bash
mysql -u root -p < database/schema.sql
```

### Option B: Online MySQL (for testing)
Use: https://www.freemysqlhosting.net/ or similar

## ⚙️ Step 3: Configure Environment (1 min)

### Backend Setup
```bash
cd backend
cp ../.env.example .env
```

Edit `.env` with your settings:
```
PORT=3001
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=touvel
JWT_SECRET=your_super_secret_key_2024
NODE_ENV=development
```

## 📦 Step 4: Install & Run Backend (1 min)
```bash
cd backend
npm install
npm start
```

You should see: `✅ Server running on http://localhost:3001`

## 🎨 Step 5: Run Frontend (1 min)

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## 🌐 Access Your Website

**Frontend:** http://localhost:5173/
**Backend API:** http://localhost:3001/api

## 🔐 Test Login Credentials

### Demo Account
- **Email:** demo@touvel.com
- **Password:** Demo@2024!

### Create New Account
Click "Register" on the login page

## 📱 Website Features Now Available

✅ User Registration & Login
✅ Browse Destinations
✅ Create Travel Trips
✅ Make Bookings
✅ View Bookings
✅ Payment Integration
✅ Trip Management
✅ Responsive Design

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

### Database Connection Error
- Verify MySQL is running
- Check .env database credentials
- Ensure database schema is imported

### Frontend Won't Load
- Clear browser cache (Ctrl+Shift+Del)
- Check that backend is running
- Try different browser

## 🐳 Docker Option (Alternative)

If you prefer containers:
```bash
docker-compose up -d
```

Then access: http://localhost:5173/

## 📚 Additional Resources

- **Full API Docs:** `docs/API.md`
- **Database Schema:** `database/schema.sql`
- **Implementation Guide:** `docs/COMPLETE_IMPLEMENTATION.md`
- **Setup Instructions:** `SETUP_INSTRUCTIONS.md`

## 🎓 Next Steps After Running

1. **Register an Account** - Create your user profile
2. **Explore Destinations** - Browse available travel destinations
3. **Create a Trip** - Plan your first trip
4. **Make a Booking** - Book accommodations or tours
5. **Check Bookings** - View and manage your reservations

## 🚨 Important Notes

⚠️ **Development Mode Only** - This setup is for development. For production:
- Use environment-specific configs
- Set up proper SSL certificates
- Use production-grade database
- Enable CORS properly
- Set strong JWT secrets

## 💬 Support

For issues:
1. Check SETUP_INSTRUCTIONS.md
2. Review docs/COMPLETE_IMPLEMENTATION.md
3. Check GitHub Issues

## 📊 Project Architecture

```
Touvel (Single Codebase)
├── Frontend (React + Vite) -> Port 5173
├── Backend (Express.js) -> Port 3001
└── Database (MySQL) -> Default Port
```

## ✨ Features Included

- User Authentication (JWT-based)
- Complete CRUD for Trips
- Booking System
- Payment Processing Ready
- Responsive Mobile Design
- Real-time Search
- User Dashboard
- Trip Itineraries

## 🎉 Success!

Once you see both servers running, your Touvel application is ready!

**Frontend:** http://localhost:5173/ ✅
**Backend:** http://localhost:3001/api ✅

# 🌍 Touvel - Travel Planning Platform

**Touvel** is a comprehensive travel planning application designed to revolutionize how people organize, plan, and share their journeys. Built with cutting-edge technology, it combines AI-powered itinerary generation, real-time pricing, and seamless booking management.

## 🚀 Features

### Core Features
- **AI-Powered Itinerary Generation**: Automatically create personalized travel itineraries based on preferences
- **Real-Time Pricing**: Compare prices across multiple travel providers
- **DIY Planning Tools**: Flexible tools for custom trip planning
- **Group Collaboration**: Share and collaborate on trips with friends and family
- **Multi-Language Support**: Support for multiple languages including Chinese
- **Booking Management**: Manage all your bookings in one place
- **Smart Recommendations**: Get AI-suggested destinations and activities

### Additional Features
- WiFi & USB Device Management
- Budget Tracking & Analysis
- Travel Insurance Integration
- Local Guide Integration
- Payment Processing
- User Authentication & Authorization
- Admin Dashboard

## 🛠 Tech Stack

### Frontend
- **React.js** - UI Framework
- **Redux** - State Management
- **Axios** - HTTP Client
- **Material-UI / Tailwind CSS** - Styling
- **Google Maps API** - Location Services

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **JWT** - Authentication
- **Multer** - File Upload Handling

### Database
- **MySQL** - Primary Database
- **Redis** - Caching Layer (Optional)

### APIs & Services
- **Stripe/PayPal** - Payment Processing
- **Twilio** - SMS Notifications
- **Google Places API** - Location Data
- **OpenWeather API** - Weather Information
- **Skyscanner/Amadeus API** - Flight Data

## 📁 Project Structure

```
Touvel/
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── redux/           # Redux store
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   └── App.js
│   ├── package.json
│   └── README.md
│
├── backend/                  # Node.js Backend
│   ├── config/              # Configuration files
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── models/              # Database models
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business services
│   ├── utils/               # Utility functions
│   ├── validators/          # Input validation
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── database/                 # Database
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Seed data
│   └── schema.sql           # Database schema
│
├── docs/                     # Documentation
│   ├── API.md               # API Documentation
│   ├── SETUP.md             # Setup Guide
│   └── ARCHITECTURE.md      # Architecture Documentation
│
├── .gitignore
├── .env.example
├── docker-compose.yml       # Docker compose file
├── package.json             # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL (v5.7 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kylec1114/Touvel.git
   cd Touvel
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Set up database**
   ```bash
   # Create database
   mysql -u root -p < ../database/schema.sql
   ```

6. **Start the backend**
   ```bash
   cd ../backend
   npm start
   ```

7. **Start the frontend**
   ```bash
   cd ../frontend
   npm start
   ```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

For detailed API documentation, please see [API.md](./docs/API.md)

### Key Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/trips` - Get user trips
- `POST /api/trips` - Create new trip
- `GET /api/destinations` - Get popular destinations
- `GET /api/itinerary` - Generate AI itinerary
- `POST /api/bookings` - Create booking

## 🗄 Database Schema

Main tables:
- `users` - User accounts
- `trips` - Trip information
- `itineraries` - Detailed itineraries
- `bookings` - Booking records
- `destinations` - Destination data
- `activities` - Activity listings
- `payments` - Payment records

See [database/schema.sql](./database/schema.sql) for complete schema.

## 🔐 Security Features

- JWT-based authentication
- Password encryption with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- SQL injection prevention
- XSS protection

## 📱 Mobile & Responsive Design

- Fully responsive UI
- Mobile-first approach
- Progressive Web App (PWA) support
- Offline functionality

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd ../frontend
npm test
```

## 📦 Deployment

### Docker Deployment
```bash
docker-compose up
```

### Production Deployment
- Frontend: Vercel / Netlify / AWS S3
- Backend: Heroku / AWS EC2 / DigitalOcean
- Database: AWS RDS / DigitalOcean

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows our style guide and all tests pass.

## 📧 Support

For support, email support@touvel.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Thanks to all contributors
- Special thanks to the travel community
- Inspired by modern travel platforms

---

**Made with ❤️ by the Touvel Team**

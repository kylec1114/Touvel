# 🌍 Touvel - Travel Planning & Booking Platform
> 🚀 Multi-product, API-driven travel booking system

**Touvel** is a comprehensive travel planning and booking platform designed to revolutionize how people organize, plan, and book their journeys. Built with cutting-edge technology, it combines AI-powered itinerary generation, real-time pricing, inventory management, and seamless booking workflows.

## 🚀 Key Features

### Core Platform Features
- **Multi-Product Booking**: Itineraries, activities, transport, and accommodations
- **AI-Powered Itinerary Generation**: Automatically create personalized travel plans
- **Supplier Management Portal**: Product creation, inventory management, order processing
- **Smart Quote & Booking Flow**: Quote generation with atomic inventory locking
- **Role-Based Access**: Traveler, Supplier, and Admin roles with appropriate permissions
- **Real-Time Availability**: Dynamic inventory calendar management
- **Multi-Language Support**: Content localization for global markets

### Technical Features
- RESTful API with comprehensive OpenAPI 3.0 specification
- JWT authentication with role-based authorization
- PostgreSQL database with optimized schema design
- Atomic inventory locking to prevent overselling
- Booking state machine (PENDING → AWAITING_PAYMENT → CONFIRMED)
- Payment integration ready (Stripe/PayPal)

## 🏗️ Architecture

### System Design
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Style**: RESTful with proper HTTP methods and status codes

### Key Modules
1. **Authentication & Authorization** - User management with multi-role support
2. **Product Catalog** - Multi-type products with multi-language content
3. **Inventory Management** - Date-based calendar with capacity tracking
4. **Booking Engine** - Quote generation and atomic booking creation
5. **Supplier Portal** - Product and inventory management
6. **AI Itinerary** - Intelligent travel planning with product attachment

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Logging**: Winston

### Frontend (Existing)
- **Framework**: React.js
- **State Management**: Redux
- **HTTP Client**: Axios
- **Styling**: Material-UI / Tailwind CSS

### APIs & Integrations
- **Payment**: Stripe, PayPal (ready to integrate)
- **Notifications**: Email/SMS via Twilio/SendGrid
- **Maps**: Google Maps/Places API
- **AI**: OpenAI for itinerary generation

## 📁 Project Structure

```
Touvel/
├── backend/                  # Node.js Backend
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── products.js      # Product catalog
│   │   ├── suppliers.js     # Supplier management
│   │   ├── bookings.js      # Booking & quote APIs
│   │   └── ai.js            # AI itinerary generation
│   ├── middleware/          # Custom middleware
│   │   └── auth.js          # JWT authentication
│   ├── db.js                # Database connection
│   ├── server.js            # Express app setup
│   └── package.json
│
├── database/                # Database files
│   ├── schema_enhanced.sql  # PostgreSQL schema
│   ├── seed_data.sql        # Sample data
│   └── migration_notes.sql  # Migration guide
│
├── docs/                    # Documentation
│   ├── openapi.yaml         # API specification (OpenAPI 3.0)
│   ├── TECHNICAL_IMPLEMENTATION.md  # Technical guide
│   ├── IMPLEMENTATION_GUIDE_ZH.md   # 中文實作指南
│   └── API.md               # API documentation
│
├── frontend/                # React Frontend
│   └── (existing structure)
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kylec1114/Touvel.git
   cd Touvel
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb touvel_db
   
   # Run schema
   psql -d touvel_db -f database/schema_enhanced.sql
   
   # Seed sample data (optional)
   psql -d touvel_db -f database/seed_data.sql
   ```

3. **Backend Setup**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp ../.env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   
   # Start server
   npm start
   ```
   
   Server will run on `http://localhost:5000`

4. **Frontend Setup** (if needed)
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Test Accounts

Use these credentials from seed data:

- **Traveler**: `traveler@example.com` / `password123`
- **Supplier**: `supplier@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## 📚 API Documentation

### API Overview

Visit `http://localhost:5000/api` after starting the server for a complete endpoint list.

### Key Endpoints

#### Authentication
```bash
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login
GET  /api/auth/me        # Get current user
```

#### Products (Public)
```bash
GET /api/products              # Search products
GET /api/products/:id          # Product details
GET /api/products/:id/availability  # Availability calendar
```

#### Bookings (Authenticated)
```bash
POST /api/bookings/quote       # Create quote
POST /api/bookings             # Create booking
POST /api/bookings/:id/confirm # Confirm booking
POST /api/bookings/:id/cancel  # Cancel booking
GET  /api/bookings/user/me     # User's bookings
```

#### Suppliers (Authenticated - Supplier role)
```bash
POST /api/suppliers/products              # Create product
GET  /api/suppliers/products              # List products
PUT  /api/suppliers/products/:id          # Update product
GET  /api/suppliers/inventory/:productId/calendar  # View inventory
PUT  /api/suppliers/inventory/:productId  # Update inventory
```

#### AI Itinerary (Authenticated)
```bash
POST /api/ai/itineraries/generate        # Generate itinerary
GET  /api/ai/itineraries                 # List itineraries
POST /api/ai/itineraries/:id/attach-products  # Attach products
```

### Full API Specification

See comprehensive OpenAPI 3.0 specification: [`docs/openapi.yaml`](docs/openapi.yaml)

## 🗄 Database Schema

### Core Tables

- **users** - User accounts with role-based access (traveler/supplier/admin)
- **suppliers** - Supplier company information and KYC status
- **destinations** - Travel destinations catalog
- **products** - Multi-type product catalog (itinerary/activity/transport/accommodation)
- **product_contents** - Multi-language product content
- **inventory_slots** - Date-based availability and capacity management
- **quotes** - Price quotes (non-committal)
- **bookings** - Confirmed bookings with state machine
- **payments** - Payment transaction records
- **ai_itineraries** - AI-generated travel itineraries
- **reviews** - Product reviews and ratings
- **wishlist** - User saved products

Complete schema: [`database/schema_enhanced.sql`](database/schema_enhanced.sql)

## 🔐 Security Features

- **JWT Authentication**: Stateless authentication with 7-day token expiration
- **Password Encryption**: Bcrypt hashing with 10 rounds
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Role-Based Authorization**: Fine-grained access control
- **Helmet.js**: Security headers middleware
- **Input Validation**: Request validation on all endpoints

## 📱 Booking Flow

### 1. Quote Generation (No Inventory Impact)
```bash
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid",
    "date": "2024-06-15",
    "pax": [{"type": "adult", "qty": 2}]
  }'
```

Response includes:
- Quote ID
- Total price and breakdown
- Valid until timestamp (15 minutes)

### 2. Booking Creation (Atomic Inventory Lock)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "quote-uuid",
    "userInfo": {"name": "John", "email": "john@example.com"},
    "paymentMode": "pay_now"
  }'
```

Backend atomically:
- Locks inventory with `SELECT FOR UPDATE`
- Verifies availability
- Reduces inventory count
- Creates booking with AWAITING_PAYMENT status
- Sets 15-minute expiration timer

### 3. Booking Confirmation (After Payment)
```bash
curl -X POST http://localhost:5000/api/bookings/:id/confirm \
  -H "Authorization: Bearer <token>" \
  -d '{"paymentRef": "payment-id"}'
```

Updates booking status to CONFIRMED

## 🧪 Testing

### API Testing Examples

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "traveler@example.com", "password": "password123"}'
```

#### Search Activities
```bash
curl "http://localhost:5000/api/products?type=activity&page=1&size=10"
```

#### Generate AI Itinerary
```bash
curl -X POST http://localhost:5000/api/ai/itineraries/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Hong Kong",
    "days": 3,
    "budget": 5000,
    "preferences": {"interests": ["culture", "food"]}
  }'
```

## 📦 Deployment

### Docker Deployment (Recommended)
```bash
docker-compose up
```

### Manual Deployment

**Backend:**
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Start Node.js server

**Frontend:**
- Deploy to Vercel, Netlify, or AWS S3/CloudFront
- Update API endpoint configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/touvel_db

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📖 Documentation

- **Technical Implementation Guide**: [`docs/TECHNICAL_IMPLEMENTATION.md`](docs/TECHNICAL_IMPLEMENTATION.md)
- **實作指南（中文版）**: [`docs/IMPLEMENTATION_GUIDE_ZH.md`](docs/IMPLEMENTATION_GUIDE_ZH.md)
- **OpenAPI Specification**: [`docs/openapi.yaml`](docs/openapi.yaml)
- **Database Schema**: [`database/schema_enhanced.sql`](database/schema_enhanced.sql)
- **Migration Guide**: [`database/migration_notes.sql`](database/migration_notes.sql)

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Multi-product catalog
- ✅ Inventory management
- ✅ Quote & booking flow with atomic locking
- ✅ Supplier portal
- ✅ AI itinerary generation
- ✅ Role-based authentication

### Phase 2 (Next)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email/SMS notifications
- [ ] Booking voucher generation (PDF/QR codes)
- [ ] Admin dashboard APIs
- [ ] Reviews and ratings full implementation
- [ ] Advanced search with filters

### Phase 3 (Future)
- [ ] Accommodation booking integration
- [ ] External supplier API connectors
- [ ] Multi-currency support
- [ ] Mobile app APIs
- [ ] Real-time chat support
- [ ] Analytics dashboard

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

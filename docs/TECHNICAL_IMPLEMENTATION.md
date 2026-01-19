# Touvel Travel Booking Platform - Technical Implementation

## Overview

This implementation provides a comprehensive, multi-product, API-driven travel booking platform based on the detailed technical specification document. The system supports multiple product types (itineraries, activities, transport, accommodation), supplier management, intelligent booking flows with inventory locking, and AI-powered itinerary generation.

## Architecture Highlights

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (primary) with UUID-based IDs
- **Authentication**: JWT with role-based access control
- **API Design**: RESTful with comprehensive OpenAPI 3.0 specification

### Core Components

1. **User & Authentication Module**
   - Multi-role support: traveler, supplier, admin
   - JWT-based authentication with refresh tokens
   - Bcrypt password hashing

2. **Product Catalog**
   - Multi-product type support (itinerary, activity, transport, accommodation)
   - Multi-language content via `product_contents` table
   - Flexible tagging and categorization
   - Supplier-product relationship

3. **Inventory Management**
   - Date-based availability calendar
   - Atomic inventory operations
   - Support for multiple time slots per day
   - Real-time capacity tracking

4. **Booking Flow**
   - **Quote Phase**: Price estimation without inventory reduction
   - **Booking Phase**: Atomic inventory lock with transaction
   - **State Machine**: PENDING → AWAITING_PAYMENT → CONFIRMED → COMPLETED
   - Automatic expiration for unpaid bookings

5. **AI Itinerary Engine**
   - Generate multi-day itineraries based on preferences
   - Attach products to itinerary slots
   - Budget-aware recommendations

## Key Implementation Details

### 1. Atomic Inventory Locking

Using PostgreSQL's `SELECT FOR UPDATE` to prevent overselling:

```javascript
await db.query('BEGIN');

// Lock the inventory row
const lockResult = await db.query(
  `SELECT id, remaining FROM inventory_slots 
   WHERE product_id = $1 AND date = $2 
   FOR UPDATE`,
  [productId, date]
);

// Check availability
if (lockResult.rows[0].remaining < requestedQty) {
  await db.query('ROLLBACK');
  throw new Error('Insufficient inventory');
}

// Atomically reduce inventory
await db.query(
  'UPDATE inventory_slots SET remaining = remaining - $1 WHERE product_id = $2 AND date = $3',
  [requestedQty, productId, date]
);

// Create booking
await db.query('INSERT INTO bookings (...) VALUES (...)');

await db.query('COMMIT');
```

### 2. Quote vs Booking Pattern

**Quote (Non-committal)**:
- Does not reduce inventory
- Provides price breakdown
- Valid for limited time (15 minutes default)
- Can be used later to create a booking

**Booking (Committal)**:
- Atomically reduces inventory
- Can be created from quote or directly
- Enters state machine workflow
- Expires if payment not completed in time

### 3. Database Schema Design

Key features:
- **UUID Primary Keys**: Better for distributed systems and security
- **JSONB Fields**: Flexible storage for policies, metadata, user info
- **Composite Indexes**: Optimized for common queries
- **Foreign Key Constraints**: Data integrity
- **Triggers**: Automatic `updated_at` timestamp updates

### 4. Role-Based Authorization

```javascript
// Middleware checks role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
router.post('/suppliers/products', auth, checkRole('supplier'), createProduct);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with role selection
- `POST /api/auth/login` - Login and receive JWT tokens
- `GET /api/auth/me` - Get current user profile

### Products (Public)
- `GET /api/products` - Search/filter products
- `GET /api/products/:id` - Product details
- `GET /api/products/:id/availability` - Availability calendar

### Suppliers (Authenticated)
- `POST /api/suppliers/products` - Create product
- `GET /api/suppliers/products` - List own products
- `PUT /api/suppliers/products/:id` - Update product
- `GET /api/suppliers/inventory/:productId/calendar` - View inventory
- `PUT /api/suppliers/inventory/:productId` - Update inventory

### Bookings (Authenticated)
- `POST /api/bookings/quote` - Create quote
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/confirm` - Confirm booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/user/me` - User's bookings
- `GET /api/bookings/:id` - Booking details

### AI Itinerary (Authenticated)
- `POST /api/ai/itineraries/generate` - Generate itinerary
- `GET /api/ai/itineraries` - List user itineraries
- `GET /api/ai/itineraries/:id` - Itinerary details
- `POST /api/ai/itineraries/:id/attach-products` - Attach products

## Setup Instructions

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- npm or yarn

### Installation Steps

1. **Clone and Install**
```bash
git clone <repository>
cd Touvel
cd backend && npm install
```

2. **Database Setup**
```bash
# Create database
createdb touvel_db

# Run schema
psql -d touvel_db -f database/schema_enhanced.sql

# Seed test data
psql -d touvel_db -f database/seed_data.sql
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your settings
```

Required environment variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/touvel_db
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

4. **Start Server**
```bash
npm start
# Server runs on http://localhost:5000
```

### Test Accounts

From seed data:
- **Traveler**: `traveler@example.com` / `password123`
- **Supplier**: `supplier@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## Testing Examples

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "traveler@example.com", "password": "password123"}'
```

### 2. Search Products
```bash
curl "http://localhost:5000/api/products?type=activity&page=1&size=10"
```

### 3. Create Quote
```bash
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "pppppppp-pppp-pppp-pppp-pppppppppp01",
    "date": "2024-06-15",
    "pax": [{"type": "adult", "qty": 2}]
  }'
```

### 4. Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "quoteId": "<QUOTE_ID>",
    "userInfo": {"name": "John Doe", "email": "john@example.com"},
    "paymentMode": "pay_now"
  }'
```

## Security Features

1. **Authentication**: JWT with 7-day expiration
2. **Password Security**: Bcrypt with 10 rounds
3. **SQL Injection Protection**: Parameterized queries
4. **CORS Protection**: Configurable origins
5. **Rate Limiting**: 100 requests per 15 minutes
6. **Input Validation**: Express-validator middleware (recommended)

## Performance Optimizations

### Database Indexes
- Composite index on `(product_id, date)` for inventory queries
- GIN index on `tags` array for fast tag filtering
- Index on `status` columns for filtering
- Index on foreign keys for joins

### Query Optimizations
- Use `SELECT FOR UPDATE` only when necessary
- Limit result sets with pagination
- Use JSONB operators for efficient JSON queries
- Cache frequently accessed data (recommend Redis)

## Scalability Considerations

### Current Architecture
- Single PostgreSQL instance
- Stateless Node.js backend (horizontal scaling ready)
- JWT tokens (no session storage needed)

### Recommended Enhancements
1. **Caching Layer**: Redis for product catalog, availability
2. **Search Engine**: Elasticsearch for advanced search
3. **Message Queue**: Kafka/RabbitMQ for async operations
4. **CDN**: CloudFront/Cloudflare for static assets
5. **Load Balancer**: nginx/ALB for traffic distribution

## Future Roadmap

### Phase 1 (Priority)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email/SMS notifications
- [ ] Booking voucher generation (PDF/QR)
- [ ] Admin dashboard APIs
- [ ] Reviews and wishlist full implementation

### Phase 2
- [ ] External supplier API connectors
- [ ] Multi-currency support
- [ ] Advanced search with Elasticsearch
- [ ] Real-time availability updates

### Phase 3
- [ ] Accommodation booking integration
- [ ] GDS/Hotel API connections
- [ ] Mobile app APIs
- [ ] Analytics and reporting dashboard

## Documentation

- **API Specification**: `docs/openapi.yaml`
- **Implementation Guide (Chinese)**: `docs/IMPLEMENTATION_GUIDE_ZH.md`
- **Database Schema**: `database/schema_enhanced.sql`
- **Seed Data**: `database/seed_data.sql`
- **Migration Notes**: `database/migration_notes.sql`

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### JWT Verification Fails
- Ensure JWT_SECRET is set in environment
- Check token format: `Authorization: Bearer <token>`
- Verify token not expired

### Inventory Lock Timeout
- Check PostgreSQL connection pool settings
- Increase lock timeout if needed
- Review transaction isolation level

## Contributing

This implementation follows the technical specification document provided. For any enhancements or bug fixes, please ensure:

1. Code follows existing patterns
2. Database migrations are provided
3. API endpoints are documented in OpenAPI spec
4. Test coverage for new features

## License

MIT

---

**Built for Touvel - Making Travel Planning Seamless**

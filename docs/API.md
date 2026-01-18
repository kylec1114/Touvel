# Touvel API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API requests require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/preferences` - Get user preferences
- `PUT /users/preferences` - Update preferences
- `DELETE /users/account` - Delete account

### Trips
- `GET /trips` - Get all user trips
- `POST /trips` - Create new trip
- `GET /trips/:id` - Get trip details
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip
- `POST /trips/:id/share` - Share trip
- `GET /trips/:id/collaborators` - Get trip collaborators

### Bookings
- `GET /bookings` - Get user bookings
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking
- `GET /bookings/:id/receipt` - Download receipt

### Destinations
- `GET /destinations` - Get popular destinations
- `GET /destinations/search` - Search destinations
- `GET /destinations/:id` - Get destination details
- `GET /destinations/:id/activities` - Get activities
- `GET /destinations/:id/weather` - Get weather
- `GET /destinations/:id/currency` - Get currency info

### Itinerary
- `POST /itinerary/generate` - Generate AI itinerary
- `GET /itinerary/:id` - Get itinerary
- `PUT /itinerary/:id` - Update itinerary
- `DELETE /itinerary/:id` - Delete itinerary
- `POST /itinerary/:id/export` - Export as PDF

### Payments
- `POST /payments/process` - Process payment
- `GET /payments/:id` - Get payment details
- `POST /payments/:id/refund` - Request refund
- `GET /payments/history` - Payment history

### Admin
- `GET /admin/users` - List all users
- `GET /admin/trips` - List all trips
- `GET /admin/bookings` - List all bookings
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/reports` - Generate report

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP
- Header: `X-RateLimit-Remaining`

## Status Codes
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Server Error

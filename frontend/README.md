# Touvel Frontend

React-based frontend for the Touvel travel booking platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to your backend URL.

## Features

- **Product Browsing**: Search and filter travel products
- **Booking Flow**: Quote → Book with real-time availability
- **My Bookings**: View and manage bookings
- **AI Itinerary**: Generate AI-powered travel plans
- **Supplier Portal**: Product and inventory management
- **Role-based UI**: Different views for travelers/suppliers/admins

## Pages

- `/` - HomePage with featured products
- `/products` - Product search and browse
- `/products/:id` - Product details and booking
- `/my-bookings` - User bookings management
- `/ai-itinerary` - AI itinerary generator
- `/supplier/dashboard` - Supplier dashboard
- `/login` - Login page

## Test Accounts

- **Traveler**: `traveler@example.com` / `password123`
- **Supplier**: `supplier@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## Tech Stack

- React 18
- React Router 6
- Vite
- CSS Modules
- Fetch API for HTTP requests

## Development

The app proxies `/api/*` requests to the backend server configured in `vite.config.js`.

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Or use the GitHub integration for automatic deployments.

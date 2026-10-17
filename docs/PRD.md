# Apollo Gears - Product Requirements Document (PRD)

## Project Overview

**Name:** Apollo Gears Backend  
**Type:** RESTful API for Car Rental Platform  
**Tech Stack:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL

---

## Visual Documentation

### JWT Authentication Flow
![JWT Auth DFD](./dfd-jwt-auth.svg)

### Business Logic Flow  
![Business Logic DFD](./dfd-business-logic.svg)

---

## 1. Core Functionality


### 1.1 User Management
- **Registration**: Users can register with email/password
- **Authentication**: JWT-based auth with access & refresh tokens
- **Roles**: `admin`, `user`, `driver`
- **Profile**: Name, email, profile image, rating

### 1.2 Car Management
- **CRUD Operations**: Create, read, update, delete cars
- **Properties**: name, brand, model, image, fuelType, passengerCapacity, color, condition, rating
- **Search & Filter**: By name, brand, model with pagination

### 1.3 Rent System
- **Create Rent**: User creates a rent request for a car
- **Properties**: startingPoint, destination, rentStatus (pending/ongoing/completed)
- **Flow**: User selects car → Creates rent → Receives driver bids

### 1.4 Bidding System
- **Driver Bids**: Drivers bid on rent requests
- **Properties**: bidAmount, bidStatus (pending/accepted/rejected), driverLocation
- **Accept Bid**: When user accepts a bid, rent status changes to "ongoing"

---

# 2 📘 Product Data Model (PRD Style)

## 1️⃣ User

**Description**  
A user represents any person using the platform. A user can be an **Admin**, **Regular User**, or **Driver**.

**Attributes**
- ID (unique identifier)
- Name
- Email (unique)
- Password (optional – supports social login)
- Role (Admin / User / Driver)
- Profile image (optional)
- Rating (average rating, default 0)
- Created date
- Last updated date

**Relationships**
- A user can create **multiple rent requests**
- A user (if role = Driver) can place **multiple bids** on rent requests

---

## 2️⃣ Car

**Description**  
A car represents a vehicle available for rent on the platform.

**Attributes**
- ID (unique identifier)
- Car name
- Brand
- Model
- Image
- Rating (average rating, default 0)
- Fuel type (Octane, Hybrid, Electric, Diesel, Petrol)
- Passenger capacity
- Color
- Condition (New / Used)
- Created date
- Last updated date

**Relationships**
- A car can be associated with **multiple rent requests**
- Each rent request uses **one specific car**

---

## 3️⃣ Rent

**Description**  
A rent represents a ride or car rental request created by a user.

**Attributes**
- ID (unique identifier)
- Rent status (Pending, Ongoing, Completed)
- Starting point
- Destination
- Created date
- Last updated date

**Relationships**
- A rent belongs to **one user** (who requested the ride)
- A rent is associated with **one car**
- A rent can receive **multiple bids** from drivers

---

## 4️⃣ Bid

**Description**  
A bid represents an offer made by a driver for a specific rent request.

**Attributes**
- ID (unique identifier)
- Bid amount
- Bid status (Pending, Accepted, Rejected)
- Driver’s current location
- Created date
- Last updated date

**Relationships**
- A bid belongs to **one rent request**
- A bid is created by **one driver (user with role = Driver)**

---

## 🔗 Relationship Summary

- One **User** → can create many **Rents**
- One **User (Driver)** → can create many **Bids**
- One **Car** → can be used in many **Rents**
- One **Rent** → belongs to one **User**
- One **Rent** → uses one **Car**
- One **Rent** → can have many **Bids**
- One **Bid** → belongs to one **Rent**
- One **Bid** → belongs to one **Driver**

---

## 🧠 Business Rules

- Only users with role **Driver** can place bids
- Only **one bid** can be accepted per rent
- When a bid is accepted:
  - Rent status becomes **Ongoing**
- When the trip is finished:
  - Rent status becomes **Completed**
- Ratings are updated after rent completion


---

## 3. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/users` | Create Admin, Driver | Admin |
| GET | `/api/v1/users` | Get all users | Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Admin |
| PATCH | `/api/v1/users/:id` | Update user | Admin |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |

### Cars
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/cars` | Create car | Admin |
| GET | `/api/v1/cars` | Get all cars | Public |
| GET | `/api/v1/cars/:id` | Get car by ID | Public |
| PATCH | `/api/v1/cars/:id` | Update car | Admin |
| DELETE | `/api/v1/cars/:id` | Delete car | Admin |

### Rents
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/rents` | Create rent request | User |
| GET | `/api/v1/rents` | Get all rents | User |
| GET | `/api/v1/rents/:id` | Get rent by ID | User |
| PATCH | `/api/v1/rents/:id` | Update rent status | User |
| DELETE | `/api/v1/rents/:id` | Delete rent | User |

### Bids
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/bids` | Place bid on rent | Driver |
| GET | `/api/v1/bids` | Get all bids | User |
| GET | `/api/v1/bids/:id` | Get bid by ID | User |
| PATCH | `/api/v1/bids/:id` | Accept/reject bid | User |
| DELETE | `/api/v1/bids/:id` | Delete bid | Driver |

---

## 4. Project Structure

```
src/
├── config/index.ts           # Environment config
├── lib/prisma.ts             # Prisma client instance
├── errors/
│   ├── AppError.ts           # Custom error class
│   ├── handlePrismaError.ts  # Prisma error handler
│   ├── handlePrismaValidationError.ts
│   └── handleZodError.ts     # Zod validation errors
├── interface/
│   └── error.ts              # Error type definitions
├── middlewares/
│   ├── auth.ts               # JWT auth middleware
│   ├── globalErrorhandler.ts # Global error handler
│   ├── notFound.ts           # 404 handler
│   └── validateRequest.ts    # Zod validation middleware
├── modules/
│   ├── Auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   ├── auth.service.ts
│   │   ├── auth.utils.ts     # JWT helpers
│   │   └── auth.validation.ts
│   ├── User/
│   │   ├── user.constant.ts
│   │   ├── user.controller.ts
│   │   ├── user.route.ts
│   │   ├── user.service.ts
│   │   ├── user.utils.ts
│   │   └── user.validation.ts
│   ├── Car/
│   │   ├── car.constant.ts
│   │   ├── car.controller.ts
│   │   ├── car.interface.ts
│   │   ├── car.route.ts
│   │   ├── car.service.ts
│   │   └── car.validation.ts
│   ├── Rent/
│   │   ├── rent.controller.ts
│   │   ├── rent.route.ts
│   │   ├── rent.service.ts
│   │   └── rent.validation.ts
│   └── Bid/
│       ├── bid.controller.ts
│       ├── bid.route.ts
│       ├── bid.service.ts
│       └── bid.validation.ts
├── routes/index.ts           # Route aggregator
├── utils/
│   ├── catchAsync.ts         # Async error wrapper
│   └── sendResponse.ts       # Response formatter
├── app.ts                    # Express app setup
└── server.ts                 # Server entry point
```

---

## 5. Technical Specifications

### Environment Variables
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_ACCESS_SECRET=secret_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUND=12
```

### Dependencies
**Production:**
- express, cors, cookie-parser, dotenv
- @prisma/client, @prisma/adapter-pg, pg
- bcryptjs, jsonwebtoken
- zod, http-status

**Development:**
- typescript, ts-node-dev, prisma
- eslint, prettier, @types/*

---

## 6. Business Logic Rules

1. **User Registration**: Hash password with bcrypt before storing
2. **Login**: Verify password, return access + refresh tokens as cookies
3. **Auth Middleware**: Verify JWT, check user exists, validate role permissions
4. **Create Rent**: User must be authenticated, car must exist
5. **Place Bid**: Only drivers can bid, rent must be in "pending" status
6. **Accept Bid**: When bid accepted, rent status changes to "ongoing"
7. **Pagination**: All list endpoints support `page`, `limit`, `sortBy`, `sortOrder`
8. **Search**: Cars searchable by name, brand, model

---

## 7. Response Format

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "meta": { "page": 1, "limit": 10, "total": 100 },
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorSources": [
    { "path": "field_name", "message": "Specific error" }
  ],
  "stack": "..." // Only in development
}
```

---

## 8. Deployment Checklist

1. Set `NODE_ENV=production`
2. Configure PostgreSQL (Neon, Supabase, or self-hosted)
3. Run `npx prisma generate && npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm start`

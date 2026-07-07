# Admin Authentication Setup

This document describes the JWT-based authentication system for admin users.

## Overview

The authentication system uses:
- **JWT (JSON Web Tokens)** for stateless authentication
- **Passport.js** with passport-jwt strategy for token validation
- **bcryptjs** for password hashing
- **ConfigService** for environment variable management

## Database Schema

The `admin` table stores admin credentials:

```prisma
model admin {
  admin_id       Int      @id @default(autoincrement())
  admin_username String   @unique
  admin_password String
  last_logged_in DateTime?
  created_at     DateTime @default(now())
}
```

## Environment Variables

Add these to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRES_IN=1d
```

**Generating a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Setting Up Admin Credentials

Admin credentials must be manually inserted into the database after setup.

**1. Hash the password:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10));"
```

**2. Insert into database:**
```sql
INSERT INTO admin (admin_username, admin_password) 
VALUES ('admin', '$2b$10$hashed_password_from_above');
```

## API Endpoints

### Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "admin_username": "admin",
  "admin_password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Protecting Routes

Use the `JwtAuthGuard` to protect admin routes:

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  @Get('dashboard')
  getDashboard() {
    return 'Protected admin data';
  }
}
```

**Accessing user info in protected routes:**
```typescript
import { Request } from 'express';

@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  return req.user;  // { adminId: 1, username: 'admin' }
}
```

## Testing with Postman

**1. Login request:**
- Method: POST
- URL: `http://localhost:3000/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "admin_username": "admin",
  "admin_password": "your_password"
}
```

**2. Protected route request:**
- Method: GET
- URL: `http://localhost:3000/admin/dashboard`
- Headers: `Authorization: Bearer <paste_token_here>`

## Security Considerations

- **Never commit actual secrets** to version control
- **Use strong, random JWT secrets** (32+ characters)
- **Change JWT secrets** if compromised
- **Use HTTPS** in production to protect tokens in transit
- **Set appropriate token expiration** based on security requirements
- **Admin credentials are not editable via API** - they must be managed directly in the database

## Architecture

The auth module consists of:

- **auth.controller.ts** - Handles login requests
- **auth.service.ts** - Validates credentials and generates tokens
- **strategies/jwt.strategy.ts** - Validates JWT tokens
- **guards/jwt-auth.guard.ts** - Protects routes
- **dto/login.dto.ts** - Login request validation
- **dto/login-response.dto.ts** - Login response structure
- **auth.module.ts** - Module configuration

## Troubleshooting

**"JWT_SECRET is not configured" error:**
- Ensure JWT_SECRET is set in your `.env` file
- Restart the server after adding the variable

**401 Unauthorized on protected routes:**
- Check that the token is included in the Authorization header
- Verify the token hasn't expired
- Ensure the token format is correct: `Bearer <token>`

**"Invalid credentials" error:**
- Verify admin_username and admin_password are correct
- Check that the admin user exists in the database
- Ensure the password is hashed with bcrypt

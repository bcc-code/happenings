# Super Admin Authentication

Simple JWT-based authentication for super admin users. This is a development-friendly alternative to Auth0 that uses environment variables for credentials.

## Environment Variables

Add these to your `.env` file in the `api/` directory:

```bash
# Super Admin Credentials
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=admin

# JWT Secret (change this in production!)
JWT_SECRET=super-admin-secret-change-in-production
```

## Default Credentials

If not set in environment variables, the defaults are:
- **Username**: `admin`
- **Password**: `admin`
- **JWT Secret**: `super-admin-secret-change-in-production`

⚠️ **Important**: Change these defaults in production!

## API Endpoints

### Login
```
POST /api/shared/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

### Verify Token
```
GET /api/shared/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "valid": true,
    "user": {
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

## Usage

1. Start the API server
2. Navigate to `/login` in the admin dashboard
3. Enter your credentials (default: `admin` / `admin`)
4. You'll be redirected to `/content` after successful login

## Token Storage

The frontend stores the JWT token in a secure HTTP-only cookie named `super_admin_token`.

## Security Notes

- This is intended for development/testing purposes
- For production, consider migrating to Auth0 or a more robust authentication system
- Always use strong passwords and JWT secrets in production
- Tokens expire after 24 hours

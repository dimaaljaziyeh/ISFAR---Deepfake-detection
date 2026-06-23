# Migration Guide: Supabase to NestJS Backend

This document describes the migration from Supabase to a standalone NestJS backend with PostgreSQL and Prisma ORM.

## Overview

The application has been migrated from using Supabase directly from the React frontend to a standalone NestJS backend with:
- PostgreSQL database (direct connection, not via Supabase)
- Prisma ORM for database operations
- JWT-based authentication
- Role-based authorization (admin/user)
- REST API endpoints
- Swagger documentation

## Architecture Changes

### Before (Supabase)
- Frontend directly calls Supabase client
- Supabase handles authentication and database
- Row Level Security (RLS) for authorization
- Supabase Auth for user management

### After (NestJS Backend)
- Frontend calls REST API endpoints
- NestJS backend handles all business logic
- JWT tokens for authentication
- Role-based guards for authorization
- Prisma ORM for database operations

## File Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/          # Data transfer objects
│   │   ├── guards/       # JWT and roles guards
│   │   ├── strategies/   # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── users/            # Users module
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── detections/       # Detections module
│   │   ├── dto/
│   │   ├── detections.controller.ts
│   │   ├── detections.module.ts
│   │   └── detections.service.ts
│   ├── contact/          # Contact module
│   │   ├── dto/
│   │   ├── contact.controller.ts
│   │   ├── contact.module.ts
│   │   └── contact.service.ts
│   ├── prisma/           # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma     # Database schema
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend Changes
- Created `src/lib/api.ts` - API client for REST calls
- Updated `src/providers/AuthProvider.tsx` - JWT-based auth
- Updated `src/routes/login.tsx` - Use API client
- Updated `src/routes/signup.tsx` - Use API client
- Updated `src/routes/detector.tsx` - Use API client
- Updated `src/routes/admin.tsx` - Use API client
- Updated `src/start.ts` - Removed Supabase middleware
- Updated `.env` - Added API URL

## Database Schema

The Prisma schema mirrors the original Supabase schema:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  roles     UserRole[]
  detections Detection[]
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  role      AppRole  // ADMIN or USER
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, role])
}

model Detection {
  id         String          @id @default(uuid())
  userId     String?
  fileName   String
  mediaType  MediaType      // IMAGE or VIDEO
  result     DetectionResult // REAL or FAKE
  confidence Float
  createdAt  DateTime        @default(now())
  user       User?           @relation(fields: [userId], references: [id])
}

model ContactMessage {
  id        String   @id @default(uuid())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user (returns JWT token)
- `POST /auth/login` - Login user (returns JWT token)
- `GET /auth/profile` - Get current user profile

### Detections
- `POST /detections` - Create detection
- `GET /detections` - Get detections (own for users, all for admins)
- `DELETE /detections/:id` - Delete detection

### Users (Admin only)
- `POST /users/:userId/roles/:role` - Assign role
- `POST /users/:userId/roles/:role/remove` - Remove role

### Contact
- `POST /contact` - Submit message (public)
- `GET /contact` - Get all messages (admin only)
- `DELETE /contact/:id` - Delete message (admin only)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd isfar-truth-shield-main/isfar-truth-shield-main
# Update .env to point to the new backend
echo "VITE_API_URL=http://localhost:3001" >> .env
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Database Setup

You need a PostgreSQL database. You can use:
- Local PostgreSQL installation
- Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:14`
- Cloud PostgreSQL (AWS RDS, Google Cloud SQL, etc.)

Update the `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/isfar_db?schema=public"
```

### 4. Create Admin User

After setting up the backend, you'll need to manually assign admin role to a user:

1. Sign up a user through the frontend
2. Use the API to assign admin role:
```bash
curl -X POST http://localhost:3001/users/{user-id}/roles/ADMIN \
  -H "Authorization: Bearer {jwt-token}"
```

Or use Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

Then manually add a role record in the `user_roles` table.

## Key Differences

### Authentication
- **Before**: Supabase Auth with session management
- **After**: JWT tokens stored in localStorage

### Authorization
- **Before**: Supabase RLS policies
- **After**: NestJS guards with role checking

### Data Fetching
- **Before**: Direct Supabase client calls
- **After**: REST API calls via fetch

### Error Handling
- **Before**: Supabase error objects
- **After**: HTTP status codes and JSON error messages

## Testing the Migration

1. **Test Authentication**:
   - Sign up a new user
   - Login with the user
   - Verify JWT token is stored
   - Check profile endpoint

2. **Test Detections**:
   - Upload a file for detection
   - Verify detection is saved
   - Check detection history

3. **Test Admin Features**:
   - Assign admin role to a user
   - Login as admin
   - View all detections
   - Delete detections

4. **Test Authorization**:
   - Try to access admin endpoints as regular user
   - Verify access is denied
   - Try to delete other users' detections
   - Verify access is denied

## Rollback Plan

If you need to rollback to Supabase:

1. Restore the original frontend files from git
2. Restore Supabase environment variables
3. Remove the backend directory
4. The Supabase database remains unchanged

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure the backend CORS configuration includes your frontend URL:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

### Database Connection Errors
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb isfar_db`

### JWT Token Issues
- Verify JWT_SECRET is set in .env
- Check token expiration (default 7 days)
- Clear localStorage if token is corrupted

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations
- Use `npm run prisma:studio` to inspect database

## Performance Considerations

- The backend uses connection pooling via Prisma
- JWT tokens are stateless (no database lookup for validation)
- Consider adding Redis for session management if needed
- Implement rate limiting for production

## Security Considerations

- Change JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation on all endpoints
- Use environment variables for sensitive data
- Regularly update dependencies

## Next Steps

1. Add file upload handling for detection media
2. Implement email verification for signup
3. Add password reset functionality
4. Implement refresh token rotation
5. Add API rate limiting
6. Set up monitoring and logging
7. Add unit and integration tests
8. Configure CI/CD pipeline

## Support

For issues or questions:
- Check Swagger docs at `http://localhost:3001/api`
- Review NestJS documentation: https://docs.nestjs.com
- Review Prisma documentation: https://www.prisma.io/docs

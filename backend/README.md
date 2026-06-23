# Isfar Backend - NestJS API

Standalone NestJS backend for the Isfar Truth Shield application, replacing Supabase with MySQL, Prisma ORM, and JWT authentication.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Admin and user roles with guard protection
- **REST APIs**: Complete CRUD operations for users, detections, and contact messages
- **Prisma ORM**: Type-safe database access with MySQL
- **Swagger Documentation**: Interactive API documentation at `/api`
- **CORS Enabled**: Configured for frontend integration

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="mysql://root:password@localhost:3306/isfar_db"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

3. **Generate Prisma client**:
```bash
npm run prisma:generate
```

4. **Run database migrations**:
```bash
npm run prisma:migrate
```

5. **Start the development server**:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## API Documentation

Once the server is running, visit `http://localhost:3001/api` to access the interactive Swagger documentation.

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (requires auth)

### Users

- `GET /users/profile` - Get current user profile (requires auth)
- `POST /users/:userId/roles/:role` - Assign role to user (admin only)
- `POST /users/:userId/roles/:role/remove` - Remove role from user (admin only)

### Detections

- `POST /detections` - Create a new detection (requires auth)
- `GET /detections` - Get all detections (user own or all if admin)
- `DELETE /detections/:id` - Delete a detection (requires auth)

### Contact

- `POST /contact` - Submit a contact message (public)
- `GET /contact` - Get all contact messages (admin only)
- `DELETE /contact/:id` - Delete a contact message (admin only)

## Database Schema

### Users
- `id`: UUID (primary key)
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### User Roles
- `id`: UUID (primary key)
- `userId`: UUID (foreign key)
- `role`: Enum (ADMIN, USER)
- `createdAt`: DateTime

### Detections
- `id`: UUID (primary key)
- `userId`: UUID (foreign key, nullable)
- `fileName`: String
- `mediaType`: Enum (IMAGE, VIDEO)
- `result`: Enum (REAL, FAKE)
- `confidence`: Float (0-100)
- `createdAt`: DateTime

### Contact Messages
- `id`: UUID (primary key)
- `name`: String
- `email`: String
- `message`: String
- `createdAt`: DateTime

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run start:dev` - Start the development server with watch mode
- `npm run start:debug` - Start the development server in debug mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Security Notes

- Change `JWT_SECRET` in production to a strong, random value
- Use environment variables for sensitive configuration
- Enable HTTPS in production
- Implement rate limiting for production use
- Use a production-grade MySQL instance

## Development

To add new features:

1. Create/update Prisma schema in `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to apply changes
3. Generate Prisma client with `npm run prisma:generate`
4. Create DTOs in `src/module/dto/`
5. Create service in `src/module/service.ts`
6. Create controller in `src/module/controller.ts`
7. Update module in `src/module/module.ts`

## License

Private

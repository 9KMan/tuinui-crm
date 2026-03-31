# Twenty-Style CRM — Server

NestJS backend with Prisma ORM, PostgreSQL, Redis, and BullMQ.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
# Or for quick dev setup without migration files:
npx prisma db push
```

### 5. Seed Demo Data

```bash
npm run prisma:seed
```

### 6. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/docs`

## Docker Deployment

```bash
# From the project root
docker-compose up -d

# Or from server directory
docker build -t twenty-crm-api ..
docker run -p 3000:3000 twenty-crm-api
```

## Default Credentials

After seeding:
- **Email:** `admin@crm.local`
- **Password:** `admin123`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create new account |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (invalidate refresh token) |
| POST | `/api/v1/auth/password-reset` | Request password reset |
| POST | `/api/v1/auth/password-reset/confirm` | Confirm password reset |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users (admin only) |
| GET | `/api/v1/users/me` | Get current user profile |
| GET | `/api/v1/users/:id` | Get user by ID |
| PUT | `/api/v1/users/:id` | Update user profile |
| PUT | `/api/v1/users/:id/password` | Change password |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contacts` | List contacts (search, filter by companyId) |
| POST | `/api/v1/contacts` | Create contact |
| GET | `/api/v1/contacts/search?q=` | Search contacts |
| GET | `/api/v1/contacts/:id` | Get contact by ID |
| PUT | `/api/v1/contacts/:id` | Update contact |
| DELETE | `/api/v1/contacts/:id` | Soft delete contact |
| GET | `/api/v1/contacts/:id/activities` | Get contact timeline |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/companies` | List companies |
| POST | `/api/v1/companies` | Create company |
| GET | `/api/v1/companies/search?q=` | Search companies |
| GET | `/api/v1/companies/:id` | Get company by ID |
| PUT | `/api/v1/companies/:id` | Update company |
| DELETE | `/api/v1/companies/:id` | Soft delete company |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/activities` | List activities (filter by linkedType, linkedId) |
| POST | `/api/v1/activities` | Create activity entry |
| GET | `/api/v1/activities/:id` | Get activity by ID |

## JWT Tokens

- **Access Token:** 15 minutes expiry, sent as `Authorization: Bearer <token>`
- **Refresh Token:** 7 days expiry, used to obtain new access tokens
- Refresh tokens are stored in the database (and optionally Redis) and revoked on logout

## Scripts

```bash
npm run build           # Build for production
npm run start           # Start production server
npm run start:dev       # Start with hot reload
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio
npm run prisma:seed    # Seed demo data
npm run lint            # Run ESLint
npm run test            # Run tests
```

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma   # Data model definition
│   ├── migrations/     # Migration history
│   └── seed.ts         # Database seeder
├── src/
│   ├── main.ts         # Bootstrap
│   ├── app.module.ts   # Root module
│   ├── prisma/         # Prisma service
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── contacts/       # Contacts CRM
│   ├── companies/      # Companies CRM
│   ├── activities/    # Activity timeline
│   └── common/        # Shared decorators, guards, filters
└── Dockerfile
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://... | PostgreSQL connection string |
| REDIS_HOST | localhost | Redis host |
| REDIS_PORT | 6379 | Redis port |
| JWT_SECRET | crm-secret-key | JWT signing secret |
| PORT | 3000 | Server port |
| CORS_ORIGIN | http://localhost:5173 | Allowed CORS origin |

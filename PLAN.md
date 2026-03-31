# Twenty-Style CRM — Implementation Plan

## Spec Review: APPROVED ✅

The SPEC.md is well-structured with clear vision. Minor notes:
- Phase 2+ items need implementation (currently empty checkboxes)
- Data model is complete and sound
- The multi-tenancy path is left open via `workspaceId` ready

---

## Tech Stack Decisions

### ORM: **Prisma** (not TypeORM)

**Rationale:**
- Schema-first DX is superior for a large data model (25+ entities)
- Type-safe client with zero runtime overhead vs TypeORM's heavy entity manager
- Cleaner migrations with `prisma migrate`
- "No `any`" quality standard is easier to enforce with Prisma's strict typing
- Better tooling for custom objects (dynamic schema extension)

**Decision: Prisma 5.x with PostgreSQL 15+ (pgvector-ready)**

### Auth: JWT with Refresh Tokens

Using NestJS `@nestjs/jwt` + `@nestjs/passport`. Refresh tokens stored in Redis for revocation capability.

### Job Queues: BullMQ

NestJS `@nestjs/bullmq` wrapper. Redis-backed. Used for:
- Email sending with retries
- Automation trigger execution
- File processing
- Scheduled task reminders

### API: RESTful + OpenAPI

NestJS Swagger (`@nestjs/swagger`) auto-generates docs from decorators.

---

## Server Folder Structure

```
/server
├── prisma/
│   ├── schema.prisma          # All data models
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed data (demo user, default pipeline)
│
├── src/
│   ├── main.ts                # Bootstrap
│   ├── app.module.ts          # Root module
│   │
│   ├── common/
│   │   ├── decorators/        # @CurrentUser, @Roles, @Public, etc.
│   │   ├── guards/            # JwtAuthGuard, RolesGuard, ThrottlerGuard
│   │   ├── filters/            # HttpExceptionFilter, PrismaExceptionFilter
│   │   ├── interceptors/     # LoggingInterceptor, TransformInterceptor
│   │   ├── pipes/              # ValidationPipe (global)
│   │   └── utils/              # UUID generation, slugify, etc.
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts  # PrismaClient singleton
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/         # JwtStrategy, LocalStrategy
│   │   ├── dto/                # LoginDto, RegisterDto, RefreshTokenDto, etc.
│   │   └── interfaces/         # JwtPayload, TokenPair
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── roles/
│   │   ├── roles.module.ts
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   └── dto/
│   │
│   ├── contacts/
│   │   ├── contacts.module.ts
│   │   ├── contacts.controller.ts
│   │   ├── contacts.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── companies/
│   │   ├── companies.module.ts
│   │   ├── companies.controller.ts
│   │   ├── companies.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── deals/
│   │   ├── deals.module.ts
│   │   ├── deals.controller.ts
│   │   ├── deals.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── queues/            # Deal stage change notifications
│   │
│   ├── tasks/
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── queues/            # Task reminder notifications
│   │
│   ├── events/
│   │   ├── events.module.ts
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── notes/
│   │   ├── notes.module.ts
│   │   ├── notes.controller.ts
│   │   ├── notes.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── files/
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── activities/
│   │   ├── activities.module.ts
│   │   ├── activities.controller.ts
│   │   ├── activities.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── automation/
│   │   ├── automation.module.ts
│   │   ├── automation.controller.ts
│   │   ├── automation.service.ts
│   │   ├── automation.runner.ts  # Executes automation triggers
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── custom-objects/
│   │   ├── custom-objects.module.ts
│   │   ├── custom-objects.controller.ts
│   │   ├── custom-objects.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── views/
│   │   ├── views.module.ts
│   │   ├── views.controller.ts
│   │   ├── views.service.ts
│   │   ├── dto/
│   │   └── entities/
│   │
│   ├── search/
│   │   ├── search.module.ts
│   │   ├── search.controller.ts
│   │   ├── search.service.ts   # Full-text search across entities
│   │   └── dto/
│   │
│   ├── audit/
│   │   ├── audit.module.ts
│   │   ├── audit.controller.ts
│   │   ├── audit.service.ts
│   │   └── entities/
│   │
│   ├── settings/
│   │   ├── settings.module.ts
│   │   ├── settings.controller.ts
│   │   ├── settings.service.ts
│   │   └── dto/
│   │
│   └── email/
│       ├── email.module.ts
│       ├── email.controller.ts
│       ├── email.service.ts
│       ├── email-queue.processor.ts  # BullMQ processor
│       ├── dto/
│       └── templates/           # Email template files
│
├── test/
│   ├── *.spec.ts               # Unit tests
│   └── *.e2e-spec.ts           # E2E tests
│
├── Dockerfile
├── docker-entrypoint.sh        # Run migrations + seed on startup
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

---

## Prisma Schema Design (Key Patterns)

```prisma
// Base model for soft-delete + timestamps
model BaseModel {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}

model User extends BaseModel {
  email         String   @unique
  passwordHash  String
  name          String
  avatar        String?
  roleId        String
  role          Role     @relation(fields: [roleId], references: [id])
  preferences   Json     @default("{}")
  // Relations
  contacts      Contact[]
  companies     Company[]
  deals         Deal[]
  tasks         Task[]
  events        Event[]
  notes         Note[]
  files         File[]
  activities    Activity[]
  automations   Automation[]
  views         View[]
  auditLogs     AuditLog[]
}

// Polymorphic Activity pattern via discriminator fields
model Activity extends BaseModel {
  type       String   // 'email' | 'call' | 'note' | 'task' | 'event' | 'custom'
  subject    String?
  body       String?
  metadata   Json     @default("{}")
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  linkedType String  // 'contact' | 'company' | 'deal' | 'task' | 'event' | 'none'
  linkedId   String?
}
```

---

## Implementation Phases

### Phase 1: Foundation (Foundation was ✅ in SPEC — validate actual state)
**Goal:** Get a running API with auth + contacts CRUD as the first feature

| Order | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 1.1 | Scaffold NestJS server with Prisma + Docker | 2h | None |
| 1.2 | Implement Prisma schema (User, Role, Contact, Company) | 2h | 1.1 |
| 1.3 | Auth module (register, login, JWT, refresh) | 3h | 1.2 |
| 1.4 | Contacts CRUD with pagination/filter | 3h | 1.3 |
| 1.5 | Companies CRUD with pagination/filter | 2h | 1.2 (shared) |
| 1.6 | Write unit tests for auth + contacts (80% coverage target) | 3h | 1.3, 1.4 |
| 1.7 | Docker compose full stack (DB + Redis + API + Nginx) | 2h | 1.1 |

**Exit Criteria:** `POST /auth/login` → JWT, `GET /contacts` with auth guard working.

---

### Phase 2: Core CRM
**Goal:** All entity CRUD + Activities + Search

| Order | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 2.1 | Deals module (CRUD + PipelineStage) | 4h | 1.2 |
| 2.2 | Tasks module (CRUD + recurring + assignees) | 4h | 1.2 |
| 2.3 | Events/Calendar module | 3h | 1.2 |
| 2.4 | Notes module (polymorphic) | 2h | 1.2 |
| 2.5 | Activities/Timeline service (polymorphic) | 3h | 2.2, 2.3, 2.4 |
| 2.6 | Global search (PostgreSQL full-text + ILIKE fallback) | 3h | 1.2 |
| 2.7 | Files upload/download (local disk + URL) | 3h | 1.2 |
| 2.8 | Unit tests for Phase 2 modules | 4h | 2.1–2.7 |

**Exit Criteria:** All CRUD endpoints from SPEC.md API Design section functional.

---

### Phase 3: Customization Engine
**Goal:** User-defined fields, objects, views

| Order | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 3.1 | Custom Fields engine (field type registry + validation) | 4h | 1.2 |
| 3.2 | Apply custom fields to Contact, Company, Deal entities | 2h | 3.1 |
| 3.3 | Custom Objects (dynamic table rows via `custom_object_values`) | 5h | 3.1 |
| 3.4 | Saved Views (filters, sort, columns, groupBy) | 3h | 1.2 |
| 3.5 | Dashboard widgets service | 3h | 2.6 |

**Exit Criteria:** User can create a custom object "Vehicle" with fields and CRUD it via auto-generated endpoints.

---

### Phase 4: Automation
**Goal:** Workflow engine with triggers + actions

| Order | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 4.1 | Automation core (create/update/list workflows) | 3h | 1.2 |
| 4.2 | Trigger evaluators (record change, schedule, webhook) | 4h | 4.1 |
| 4.3 | Action executors (create/update/send email/task/webhook) | 4h | 4.1 |
| 4.4 | BullMQ job processor for automation runner | 3h | 4.2, 4.3 |
| 4.5 | Automation logs + test-mode execution | 2h | 4.4 |
| 4.6 | Email queue processor (send with open tracking) | 3h | 4.4 |

**Exit Criteria:** User creates a trigger "Contact created" + action "Create Task for assignee" and it executes.

---

### Phase 5: Permissions & Audit
**Goal:** RBAC + full audit trail

| Order | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 5.1 | Roles module (CRUD + default roles) | 2h | 1.2 |
| 5.2 | Object-level + field-level permission guards | 4h | 5.1 |
| 5.3 | Audit log interceptor (auto-capture changes) | 3h | 5.1 |
| 5.4 | Audit log API endpoint + export | 2h | 5.3 |
| 5.5 | API keys management | 2h | 5.1 |

**Exit Criteria:** User with role "Viewer" cannot create contacts; all changes logged.

---

### Phase 6: Polish & DevOps
**Goal:** Production-ready self-hosted deployment

| Order | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 6.1 | Docker multi-stage builds (nginx serving web app) | 2h | Phase 1 |
| 6.2 | Seed script (demo data: users, contacts, companies, deals) | 2h | Phase 2 |
| 6.3 | E2E test suite (Supertest) | 4h | All phases |
| 6.4 | Self-hosting README + SSL config | 2h | 6.1 |
| 6.5 | Backup/restore script | 2h | 6.1 |

---

## Critical Path

```
Phase 1 (Foundation) → Phase 2 (Core CRM) → Phase 3 (Customization) → Phase 4 (Automation) → Phase 5 (Permissions) → Phase 6 (Polish)
```

**Do NOT start Phase 2 until Phase 1 unit tests pass.**

---

## Key Conventions

1. **Every entity** extends `BaseModel` (soft-delete via `deletedAt`)
2. **Every module** has `*.dto.ts`, `*.entity.ts`, `*.service.ts`, `*.controller.ts`
3. **No `any`** — all inputs validated via `class-validator` + `class-transformer`
4. **Soft deletes** — Prisma queries always filter `deletedAt: null` via a reusable middleware
5. **Activity log** — Interceptor on all write operations creates Activity records automatically
6. **UUIDs** — All IDs are `uuid()` v4, no auto-increment integers
7. **Migrations** — Run automatically via `docker-entrypoint.sh` before server starts

---

*Plan version: 1.0*
*Created: 2026-03-29*
*Tech Lead Review*

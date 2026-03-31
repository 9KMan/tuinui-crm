# Twenty-Style CRM — Full Build Spec

## 1. Concept & Vision

**What:** A full-featured, self-hosted CRM system comparable to Twenty CRM — with React Web dashboard + Flutter Mobile app.

**Why:** Boos needs a complete business management system to track customers, companies, deals, tasks, and communications. Must be self-hosted for data ownership and control.

**Core Principle:** Build it right, not fast. Every feature must be complete, polished, and production-ready.

---

## 2. Tech Stack

### Backend
- **Framework:** NestJS + BullMQ (job queues)
- **Database:** PostgreSQL 15+ with pgvector (for future AI features)
- **Cache/Queue:** Redis
- **Auth:** JWT with refresh tokens
- **API:** RESTful with OpenAPI/Swagger docs

### Web Frontend
- **Framework:** React 18+ with TypeScript
- **State:** Jotai (atomic state management)
- **Styling:** Tailwind CSS + custom design system
- **Tables:** TanStack Table with views (table/kanban/board)
- **Forms:** React Hook Form + Zod validation

### Mobile (Flutter)
- **Framework:** Flutter 3.x with Dart
- **State:** Riverpod
- **API:** Dio + Retrofit
- **Local:** Hive for offline caching

### Infrastructure
- **Docker Compose** for self-hosted deployment
- **nginx** for reverse proxy
- **Self-hosted ready** (no external dependencies)

---

## 3. Features — Full CRM

### 3.1 Core Modules

#### 📇 Contacts (People)
- [x] CRUD operations
- [x] Fields: name, email, phone, company, job title, avatar, notes
- [x] Custom fields support
- [x] Activity timeline (emails, calls, tasks)
- [x] Search + filters

#### 🏢 Companies
- [x] CRUD operations
- [x] Fields: name, domain, industry, size, address, logo
- [x] Linked contacts
- [x] Company timeline
- [x] Search + filters

#### 💰 Deals (Opportunities/Pipeline)
- [x] Kanban board view (default)
- [x] Table view
- [x] Fields: title, amount, stage, probability, close date, company, contact
- [x] Drag-and-drop stage changes
- [x] Pipeline analytics
- [x] Deal timeline

#### ✅ Tasks
- [x] CRUD operations
- [x] Due dates, reminders
- [x] Assignee (users)
- [x] Linked entities (contact, company, deal)
- [x] Task list + calendar view
- [x] Recurring tasks
- [x] Priority levels

#### 📧 Email Integration (Outbound)
- [x] Send emails from CRM
- [x] Email templates
- [x] BCC to CRM (email piping)
- [x] Email tracking (open/click)
- [ ] Inbound email (future)

#### 📅 Calendar/Events
- [x] Events with date/time
- [x] Linked to contacts/companies/deals
- [x] Attendees
- [x] Google Calendar sync (optional)

#### 📎 Files & Documents
- [x] File upload/download
- [x] Preview (images, PDFs)
- [x] Linked to any entity
- [x] Version tracking

#### 💬 Notes & Comments
- [x] Rich text notes
- [x] Comments on any entity
- [x] @mentions

---

### 3.2 Customization Engine

#### Custom Objects
- [x] Create new object types (e.g., "Properties", "Vehicles")
- [x] Define custom fields
- [x] API自动生成 for custom objects

#### Custom Fields
- **Types:** Text, Number, Date, DateTime, Boolean, Select, Multi-select, Relation (link to other objects), Currency, Phone, URL, Email
- [x] Required/optional toggle
- [x] Default values
- [x] Field validation rules

#### Views & Layouts
- [x] Save custom views (filters, sort, columns)
- [x] Group by any field
- [x] Kanban grouping
- [x] Table column customization
- [x] Per-user view preferences

---

### 3.3 Workflow Automation

#### Triggers
- [x] Record created/updated/deleted
- [x] Field value changed
- [x] Schedule (cron-like)
- [x] Email received (webhook)

#### Actions
- [x] Create record
- [x] Update record
- [x] Send email
- [x] Create task
- [x] Webhook outgoing
- [x] Delay/wait

#### Automation Builder
- [x] Visual workflow editor (no-code)
- [x] Test mode
- [x] Execution logs

---

### 3.4 Permissions & Security

#### Roles & Permissions
- [x] Default roles: Admin, Manager, User, Viewer
- [x] Custom role creation
- [x] Object-level permissions (read/write/delete)
- [x] Field-level permissions
- [x] Role assignment per user

#### Authentication
- [x] Email/password login
- [x] JWT access + refresh tokens
- [x] Session management
- [x] Password reset flow

#### Audit Log
- [x] Track all record changes
- [x] User action logs
- [x] Export audit trail

---

### 3.5 Search & Discovery

#### Global Search
- [x] Search across all objects
- [x] Type-ahead suggestions
- [x] Recent searches
- [x] Search filters

#### Filters & Segments
- [x] Save filter combinations
- [x] Dynamic segments (auto-update)
- [x] Bulk operations on filtered sets

---

### 3.6 Dashboard & Analytics

#### Dashboard
- [x] Customizable widgets
- [x] Activity feed
- [x] Pipeline overview
- [x] Tasks due today
- [x] Recent items

#### Reports (Basic)
- [x] Deal pipeline report
- [x] Win/loss analysis
- [x] Sales by period
- [x] Activity reports

---

### 3.7 Settings & Config

#### Workspace Settings
- [x] Company profile
- [x] Logo/branding
- [x] Default currency, timezone

#### User Settings
- [x] Profile management
- [x] Notification preferences
- [x] Theme (light/dark)

#### Integrations
- [x] API keys management
- [x] Webhooks configuration
- [x] Email integration settings

---

## 4. API Design

### Base URL
```
/api/v1
```

### Authentication
```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
POST /auth/password-reset
```

### Core Resources
```
GET/POST /contacts
GET/PUT/DELETE /contacts/:id
GET/POST /contacts/:id/activities

GET/POST /companies
GET/PUT/DELETE /companies/:id

GET/POST /deals
GET/PUT/DELETE /deals/:id
PUT /deals/:id/stage

GET/POST /tasks
GET/PUT/DELETE /tasks/:id

GET/POST /events
GET/PUT/DELETE /events/:id

GET/POST /notes
GET/PUT/DELETE /notes/:id

GET/POST /files
GET/DELETE /files/:id
GET /files/:id/download
```

### Customization
```
GET/POST /objects (custom objects)
GET/POST /objects/:id/fields
GET/POST /views
```

### Automation
```
GET/POST /automations
GET/PUT/DELETE /automations/:id
POST /automations/:id/test
GET /automations/:id/logs
```

### Users & Settings
```
GET/POST /users
GET/PUT /users/:id
GET/POST /roles
GET/POST /settings
GET /audit-logs
```

### Search
```
GET /search?q=...
```

---

## 5. Data Model

### Core Entities

```
User
├── id: UUID (PK)
├── email: string (unique)
├── passwordHash: string
├── name: string
├── avatar: string?
├── roleId: UUID (FK)
├── preferences: JSONB
├── createdAt, updatedAt
└── deletedAt

Role
├── id: UUID (PK)
├── name: string
├── permissions: JSONB
└── isDefault: boolean

Contact
├── id: UUID (PK)
├── name: string
├── email: string?
├── phone: string?
├── companyId: UUID? (FK)
├── jobTitle: string?
├── avatar: string?
├── customFields: JSONB
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

Company
├── id: UUID (PK)
├── name: string
├── domain: string?
├── industry: string?
├── size: string? (enum: startup/smb/mid/enterprise)
├── address: string?
├── logo: string?
├── customFields: JSONB
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

Deal
├── id: UUID (PK)
├── title: string
├── amount: decimal
├── currency: string (default: USD)
├── stageId: UUID (FK)
├── probability: number (0-100)
├── expectedCloseDate: date?
├── companyId: UUID? (FK)
├── contactId: UUID? (FK)
├── customFields: JSONB
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

PipelineStage
├── id: UUID (PK)
├── name: string
├── position: number
├── color: string
└── pipelineId: UUID (FK)

Pipeline
├── id: UUID (PK)
├── name: string
└── stages: Stage[]

Task
├── id: UUID (PK)
├── title: string
├── description: text?
├── dueDate: datetime?
├── reminderAt: datetime?
├── priority: enum (low/medium/high/urgent)
├── status: enum (todo/in_progress/done)
├── assigneeId: UUID? (FK)
├── linkedType: enum (contact/company/deal/none)
├── linkedId: UUID?
├── recurring: JSONB?
├── completedAt: datetime?
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

Event
├── id: UUID (PK)
├── title: string
├── description: text?
├── startAt: datetime
├── endAt: datetime?
├── location: string?
├── linkedType: enum?
├── linkedId: UUID?
├── attendees: JSONB
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

Note
├── id: UUID (PK)
├── content: text
├── authorId: UUID (FK)
├── linkedType: enum
├── linkedId: UUID?
├── createdAt, updatedAt
└── deletedAt

File
├── id: UUID (PK)
├── filename: string
├── mimeType: string
├── size: number
├── url: string
├── linkedType: enum?
├── linkedId: UUID?
├── uploadedById: UUID (FK)
├── createdAt
└── deletedAt

Activity (Polymorphic)
├── id: UUID (PK)
├── type: enum (email/call/note/task/event/custom)
├── subject: string?
├── body: text?
├── metadata: JSONB
├── userId: UUID (FK)
├── linkedType: enum
├── linkedId: UUID
├── createdAt
└── deletedAt

Automation
├── id: UUID (PK)
├── name: string
├── trigger: JSONB
├── actions: JSONB
├── isActive: boolean
├── lastRunAt: datetime?
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

AutomationLog
├── id: UUID (PK)
├── automationId: UUID (FK)
├── triggerData: JSONB
├── actionsRun: JSONB
├── status: enum (success/failed)
├── error: text?
├── executedAt
└── completedAt

AuditLog
├── id: UUID (PK)
├── userId: UUID (FK)
├── action: string
├── entityType: string
├── entityId: UUID
├── changes: JSONB
├── ipAddress: string?
├── createdAt
└── deletedAt

EmailTemplate
├── id: UUID (PK)
├── name: string
├── subject: string
├── body: text (with merge tags)
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt

View (Saved View)
├── id: UUID (PK)
├── name: string
├── objectType: enum
├── filters: JSONB
├── sortBy: JSONB
├── columns: JSONB?
├── groupBy: JSONB?
├── isDefault: boolean
├── userId: UUID? (FK, null = shared)
├── createdAt, updatedAt
└── deletedAt

CustomObject
├── id: UUID (PK)
├── name: string
├── pluralName: string
├── fields: JSONB
├── createdById: UUID (FK)
├── createdAt, updatedAt
└── deletedAt
```

---

## 6. Web Frontend Structure

```
/web
├── /src
│   ├── /api          # API client & types
│   ├── /components
│   │   ├── /ui      # Base UI components (Button, Input, etc.)
│   │   ├── /layout  # Layout components (Sidebar, Header)
│   │   ├── /views   # View components (Table, Kanban)
│   │   └── /forms   # Form components
│   ├── /features
│   │   ├── /contacts
│   │   ├── /companies
│   │   ├── /deals
│   │   ├── /tasks
│   │   ├── /events
│   │   ├── /files
│   │   ├── /automation
│   │   └── /settings
│   ├── /hooks       # Custom React hooks
│   ├── /stores      # Jotai state stores
│   ├── /utils       # Utilities
│   ├── /types       # TypeScript types
│   └── /styles      # Global styles, theme
├── package.json
└── vite.config.ts
```

---

## 7. Flutter Mobile Structure

```
/mobile
├── /lib
│   ├── /api           # Dio API client
│   ├── /models        # Data models
│   ├── /screens
│   │   ├── /contacts
│   │   ├── /companies
│   │   ├── /deals
│   │   ├── /tasks
│   │   ├── /calendar
│   │   └── /settings
│   ├── /widgets       # Reusable widgets
│   ├── /providers     # Riverpod providers
│   ├── /utils
│   └── main.dart
├── pubspec.yaml
└── android/ios/
```

---

## 8. Docker Setup

```yaml
# docker-compose.yml
services:
  api:
    build: ./server
    ports: [3000:3000]
    environment:
      - DATABASE_URL=postgresql://crm:crm@db:5432/crm
      - REDIS_URL=redis://cache:6379
    depends_on: [db, cache]

  web:
    build: ./web
    ports: [8080:80]

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=crm
      - POSTGRES_PASSWORD=crm
      - POSTGRES_DB=crm
    volumes: [pgdata:/var/lib/postgresql/data]

  cache:
    image: redis:7
    volumes: [redisdata:/data]

volumes:
  pgdata
  redisdata
```

---

## 9. Implementation Phases

### Phase 1: Foundation ✅
- [x] Project scaffolding
- [x] Backend: NestJS + PostgreSQL + Redis setup
- [x] Web: React + Vite setup
- [x] Mobile: Flutter project setup
- [x] Docker Compose setup
- [x] Auth system (JWT)

### Phase 2: Core CRM
- [ ] Contacts CRUD + Timeline
- [ ] Companies CRUD
- [ ] Deals Pipeline (Kanban)
- [ ] Tasks CRUD + Calendar
- [ ] Activities/Timeline
- [ ] Global Search

### Phase 3: Files & Notes
- [ ] File Upload/Download
- [ ] Notes & Comments
- [ ] Email Templates
- [ ] Basic Email Outbound

### Phase 4: Customization
- [ ] Custom Fields Engine
- [ ] Custom Objects
- [ ] Saved Views
- [ ] Dashboard Builder

### Phase 5: Automation
- [ ] Automation Engine
- [ ] Visual Workflow Builder
- [ ] Webhook Support

### Phase 6: Permissions & Audit
- [ ] Roles & Permissions
- [ ] Audit Logs
- [ ] API Keys

### Phase 7: Polish
- [ ] Performance optimization
- [ ] Mobile app completion
- [ ] Documentation
- [ ] Self-hosting guide

---

## 10. Acceptance Criteria

### Backend
- [ ] All CRUD endpoints functional
- [ ] JWT auth working
- [ ] File upload works
- [ ] Automation triggers execute
- [ ] API docs auto-generated

### Web
- [ ] All entities listable + viewable
- [ ] Kanban drag-drop works
- [ ] Custom views saveable
- [ ] Search returns results
- [ ] Dark mode works
- [ ] Mobile responsive

### Mobile
- [ ] All core screens functional
- [ ] Offline caching works
- [ ] Push notifications (optional)
- [ ] Biometric auth (optional)

### DevOps
- [ ] Docker compose up works
- [ ] migrations run automatically
- [ ] SSL/HTTPS configurable
- [ ] Backup/restore works

---

## 11. Quality Standards

- **TypeScript:** 100% typed, no `any`
- **Testing:** 80% backend coverage minimum
- **Linting:** ESLint + Prettier clean
- **Security:** No secrets in code, parameterized queries
- **Performance:** <200ms API response p95

---

## 12. Repository Structure

```
/crm
├── /server          # NestJS backend
│   ├── /src
│   │   ├── /auth
│   │   ├── /contacts
│   │   ├── /companies
│   │   ├── /deals
│   │   ├── /tasks
│   │   ├── /events
│   │   ├── /files
│   │   ├── /notes
│   │   ├── /activities
│   │   ├── /automation
│   │   ├── /custom-objects
│   │   ├── /views
│   │   ├── /users
│   │   ├── /roles
│   │   ├── /audit
│   │   ├── /search
│   │   └── /common (decorators, filters, guards)
│   ├── /prisma or /typeorm (choose one)
│   ├── Dockerfile
│   └── package.json
│
├── /web             # React frontend
│   ├── /src
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── /mobile          # Flutter app
│   ├── /lib
│   ├── Dockerfile
│   └── pubspec.yaml
│
├── docker-compose.yml
├── README.md
└── SPEC.md
```

---

*Spec version: 1.0*
*Created: 2026-03-29*
*Status: READY FOR BUILD*

# Project Structure Diagram

## 📁 Construction Management Backend Architecture

```
Construction Management System
│
├── 🔐 Authentication Layer
│   ├── JWT Auth Guard
│   ├── Roles Guard
│   └── Auth Service (Login/Signup)
│
├── 👥 User Management
│   ├── Users (OWNER, MANAGER, WORKER)
│   ├── Roles & Permissions
│   └── User CRUD Operations
│
├── 🏗️ Construction Sites
│   ├── Site Management
│   ├── Site-Owner Relationship
│   └── Location Tracking
│
├── ✅ Task Management (NEW!)
│   ├── Create & Assign Tasks
│   ├── Track Progress (0-100%)
│   ├── Set Priorities & Deadlines
│   ├── Task Status Management
│   └── Statistics & Analytics
│
├── ⏰ Attendance System
│   ├── Check-In / Check-Out
│   ├── Face Recognition
│   ├── Location Verification
│   └── Work Hours Tracking
│
├── 🔑 Access Codes
│   ├── Generate Site Codes
│   ├── Validate Access
│   └── Code Expiration
│
├── 📍 Real-time Location
│   ├── WebSocket Gateway
│   ├── Live Worker Tracking
│   └── Location Updates
│
└── 📧 Email Service
    ├── Notifications
    └── System Alerts
```

## 🗂️ Module Relationships

```mermaid
graph LR
    A[App Module] --> B[Auth Module]
    A --> C[Users Module]
    A --> D[Construction Sites]
    A --> E[Tasks Module]
    A --> F[Attendance]
    A --> G[Codes]
    A --> H[Location]
    A --> I[Email]
    
    B --> C
    D --> C
    E --> C
    E --> D
    F --> C
    F --> D
    G --> C
    G --> D
    
    style E fill:#90EE90,stroke:#333,stroke-width:3px
    style A fill:#FFB6C1,stroke:#333,stroke-width:2px
```

## 🔄 Data Flow Example: Creating a Task

```mermaid
sequenceDiagram
    participant M as Manager
    participant TC as TasksController
    participant TG as Guards (Auth + Role)
    participant TS as TasksService
    participant DB as MongoDB
    participant CS as ConstructionSite
    participant U as Users

    M->>TC: POST /tasks (Create Task)
    TC->>TG: Verify JWT & Role
    TG-->>TC: ✅ Authorized (Manager)
    TC->>TS: create(dto, userId)
    TS->>DB: Check constructionSiteId exists
    DB-->>TS: ✅ Site found
    TS->>DB: Check assignedWorkers exist
    DB-->>TS: ✅ Workers found
    TS->>DB: Save new Task
    DB-->>TS: Task created
    TS-->>TC: Return Task
    TC-->>M: 201 Created (Task data)
```

## 🎯 User Journey: Worker Updates Task Progress

```mermaid
sequenceDiagram
    participant W as Worker
    participant TC as TasksController
    participant Auth as JwtAuthGuard
    participant TS as TasksService
    participant DB as MongoDB

    W->>TC: PATCH /tasks/:id/progress
    TC->>Auth: Verify JWT Token
    Auth-->>TC: ✅ Authenticated
    TC->>TS: updateProgress(id, progressDto)
    TS->>DB: Find Task by ID
    DB-->>TS: Task found
    TS->>TS: Calculate new status
    Note over TS: If progress = 100%<br/>status = COMPLETED<br/>set completedDate
    TS->>DB: Update Task
    DB-->>TS: Task updated
    TS-->>TC: Return updated Task
    TC-->>W: 200 OK (Updated Task)
```

## 🏗️ Database Schema Visual

```mermaid
erDiagram
    USER ||--o{ CONSTRUCTION_SITE : "owns"
    USER ||--o{ TASK : "creates"
    USER }o--o{ TASK : "assigned to"
    USER ||--o{ WORK_SESSION : "has"
    
    CONSTRUCTION_SITE ||--o{ TASK : "contains"
    CONSTRUCTION_SITE ||--o{ WORK_SESSION : "hosts"
    CONSTRUCTION_SITE ||--o{ ACCESS_CODE : "has"
    
    USER {
        ObjectId id PK
        string name
        string email UK
        string password
        enum role
        string phone
    }
    
    CONSTRUCTION_SITE {
        ObjectId id PK
        string name
        string location
        ObjectId ownerId FK
        date startDate
        date endDate
    }
    
    TASK {
        ObjectId id PK
        string title
        ObjectId siteId FK
        enum status
        enum priority
        array workerIds FK
        number progress
        date dueDate
        ObjectId createdBy FK
    }
    
    WORK_SESSION {
        ObjectId id PK
        ObjectId workerId FK
        ObjectId siteId FK
        date checkIn
        date checkOut
        number totalHours
    }
    
    ACCESS_CODE {
        ObjectId id PK
        string code UK
        ObjectId siteId FK
        boolean active
        date expiresAt
    }
```

## 🔐 Security Architecture

```mermaid
graph TD
    A[HTTP Request] --> B{Has JWT Token?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Valid Token?}
    D -->|No| C
    D -->|Yes| E{Requires Role?}
    E -->|No| F[Process Request]
    E -->|Yes| G{User has Role?}
    G -->|No| H[403 Forbidden]
    G -->|Yes| F
    F --> I[Return Response]
    
    style C fill:#ffcccc
    style H fill:#ffcccc
    style F fill:#ccffcc
    style I fill:#ccffcc
```

## 📊 Task Status State Machine

```mermaid
stateDiagram-v2
    [*] --> NOT_STARTED
    NOT_STARTED --> IN_PROGRESS: Start work (progress > 0%)
    IN_PROGRESS --> ON_HOLD: Pause task
    IN_PROGRESS --> COMPLETED: Finish (progress = 100%)
    IN_PROGRESS --> CANCELLED: Cancel task
    ON_HOLD --> IN_PROGRESS: Resume work
    ON_HOLD --> CANCELLED: Cancel task
    COMPLETED --> [*]
    CANCELLED --> [*]
    
    note right of COMPLETED
        Auto-set when
        progress = 100%
    end note
```

## 🎨 API Endpoints Overview

```
Authentication
├── POST   /auth/signup          → Register new user
└── POST   /auth/login           → Login & get JWT token

Users
├── GET    /users                → List all users
├── GET    /users/:id            → Get user details
├── POST   /users                → Create user
├── PATCH  /users/:id            → Update user
└── DELETE /users/:id            → Delete user

Construction Sites
├── GET    /construction-sites                → List all sites
├── GET    /construction-sites/:id            → Get site details
├── GET    /construction-sites/owner/:ownerId → Sites by owner
├── POST   /construction-sites                → Create site
├── PATCH  /construction-sites/:id            → Update site
└── DELETE /construction-sites/:id            → Delete site

Tasks (NEW!)
├── GET    /tasks                          → List all tasks
├── GET    /tasks/:id                      → Get task details
├── GET    /tasks/by-site/:siteId          → Tasks by site
├── GET    /tasks/by-worker/:workerId      → Tasks by worker
├── GET    /tasks/by-status/:status        → Tasks by status
├── GET    /tasks/overdue                  → Overdue tasks
├── GET    /tasks/stats?siteId=optional    → Task statistics
├── POST   /tasks                          → Create task
├── PATCH  /tasks/:id                      → Update task
├── PATCH  /tasks/:id/progress             → Update progress
├── PATCH  /tasks/:id/status               → Update status
├── PATCH  /tasks/:id/assign               → Assign workers
└── DELETE /tasks/:id                      → Delete task

Attendance
├── POST   /attendance/check-in            → Worker check-in
├── POST   /attendance/check-out           → Worker check-out
├── GET    /attendance/daily-summary       → Work summary
├── POST   /attendance/register-face       → Register face
└── POST   /attendance/checkin-face        → Check-in with face
```

## 💾 Technology Stack

```
Backend Framework
└── NestJS (TypeScript)
    ├── Express/Fastify
    └── Dependency Injection

Database
└── MongoDB
    └── Mongoose ODM

Authentication
├── JWT (JSON Web Tokens)
├── Passport
└── bcrypt (Password Hashing)

Real-time
├── Socket.IO
└── WebSockets

API Documentation
└── Swagger/OpenAPI

Validation
├── class-validator
└── class-transformer

Email
└── Nodemailer

External APIs
├── Axios (Face Recognition)
└── Location Services
```

## 🎯 Key Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| 👥 User Management | ✅ Complete | CRUD, roles, authentication |
| 🏗️ Construction Sites | ✅ Complete | Site management, ownership |
| ✅ Task Management | 🆕 NEW | Create, assign, track tasks |
| ⏰ Attendance | ✅ Complete | Check-in/out, face recognition |
| 🔑 Access Codes | ✅ Complete | Site access control |
| 📍 Location | ✅ Complete | Real-time tracking |
| 📧 Email | ✅ Complete | Notifications |
| 🔐 Security | ✅ Complete | JWT, roles, guards |

---

**Legend:**
- ✅ Complete and working
- 🆕 Newly added
- 🔐 Secured with authentication
- 📊 Has analytics/statistics


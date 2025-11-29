# Construction Management System - Class Diagrams

## Main Architecture Overview

```mermaid
classDiagram
    %% Main Application Module
    class AppModule {
        +imports: Module[]
        +controllers: Controller[]
        +providers: Provider[]
    }

    %% User Module
    class User {
        +_id: ObjectId
        +name: string
        +email: string
        +password: string
        +role: UserRole
        +phoneNumber: string
        +createdAt: Date
        +updatedAt: Date
    }

    class UserRole {
        <<enumeration>>
        OWNER
        CONSTRUCTION_MANAGER
        WORKER
    }

    class UsersService {
        +create(dto: CreateUserDto): Promise~User~
        +findAll(): Promise~User[]~
        +findOne(id: string): Promise~User~
        +findByEmail(email: string): Promise~User~
        +update(id: string, dto: UpdateUserDto): Promise~User~
        +remove(id: string): Promise~void~
    }

    class UsersController {
        +create(dto: CreateUserDto): Promise~User~
        +findAll(): Promise~User[]~
        +findOne(id: string): Promise~User~
        +update(id: string, dto: UpdateUserDto): Promise~User~
        +remove(id: string): Promise~void~
    }

    %% Construction Sites Module
    class ConstructionSite {
        +_id: ObjectId
        +name: string
        +location: string
        +description: string
        +ownerId: ObjectId
        +startDate: Date
        +endDate: Date
        +status: string
        +createdAt: Date
        +updatedAt: Date
    }

    class ConstructionSitesService {
        +create(dto: CreateConstructionSiteDto): Promise~ConstructionSite~
        +findAll(): Promise~ConstructionSite[]~
        +findOne(id: string): Promise~ConstructionSite~
        +findByOwner(ownerId: string): Promise~ConstructionSite[]~
        +update(id: string, dto: UpdateConstructionSiteDto): Promise~ConstructionSite~
        +remove(id: string): Promise~void~
    }

    class ConstructionSitesController {
        +create(dto: CreateConstructionSiteDto): Promise~ConstructionSite~
        +findAll(): Promise~ConstructionSite[]~
        +findOne(id: string): Promise~ConstructionSite~
        +findByOwner(ownerId: string): Promise~ConstructionSite[]~
        +update(id: string, dto: UpdateConstructionSiteDto): Promise~ConstructionSite~
        +remove(id: string): Promise~void~
    }

    %% Tasks Module
    class Task {
        +_id: ObjectId
        +title: string
        +description: string
        +constructionSiteId: ObjectId
        +status: TaskStatus
        +priority: TaskPriority
        +assignedWorkers: ObjectId[]
        +startDate: Date
        +dueDate: Date
        +completedDate: Date
        +progressPercentage: number
        +estimatedHours: number
        +actualHours: number
        +notes: string
        +createdBy: ObjectId
        +createdAt: Date
        +updatedAt: Date
    }

    class TaskStatus {
        <<enumeration>>
        NOT_STARTED
        IN_PROGRESS
        ON_HOLD
        COMPLETED
        CANCELLED
    }

    class TaskPriority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
        URGENT
    }

    class TasksService {
        +create(dto: CreateTaskDto, userId: string): Promise~Task~
        +findAll(): Promise~Task[]~
        +findOne(id: string): Promise~Task~
        +findByConstructionSite(siteId: string): Promise~Task[]~
        +findByWorker(workerId: string): Promise~Task[]~
        +findByStatus(status: TaskStatus): Promise~Task[]~
        +update(id: string, dto: UpdateTaskDto): Promise~Task~
        +updateProgress(id: string, dto: UpdateProgressDto): Promise~Task~
        +updateStatus(id: string, status: TaskStatus): Promise~Task~
        +assignWorkers(id: string, workerIds: string[]): Promise~Task~
        +remove(id: string): Promise~void~
        +getOverdueTasks(): Promise~Task[]~
        +getTaskStats(siteId?: string): Promise~Object~
    }

    class TasksController {
        +create(dto: CreateTaskDto): Promise~Task~
        +findAll(): Promise~Task[]~
        +findOne(id: string): Promise~Task~
        +findByConstructionSite(siteId: string): Promise~Task[]~
        +findByWorker(workerId: string): Promise~Task[]~
        +findByStatus(status: TaskStatus): Promise~Task[]~
        +update(id: string, dto: UpdateTaskDto): Promise~Task~
        +updateProgress(id: string, dto: UpdateProgressDto): Promise~Task~
        +updateStatus(id: string, status: TaskStatus): Promise~Task~
        +assignWorkers(id: string, dto: AssignWorkersDto): Promise~Task~
        +remove(id: string): Promise~void~
        +getStats(siteId?: string): Promise~Object~
        +getOverdueTasks(): Promise~Task[]~
    }

    %% Attendance Module
    class WorkSession {
        +_id: ObjectId
        +workerId: ObjectId
        +siteId: ObjectId
        +checkInTime: Date
        +checkOutTime: Date
        +checkInLocation: Location
        +checkOutLocation: Location
        +totalHours: number
        +status: string
        +createdAt: Date
        +updatedAt: Date
    }

    class Location {
        +latitude: number
        +longitude: number
        +address: string
    }

    class AttendanceService {
        +checkIn(dto: CheckInDto): Promise~WorkSession~
        +checkOut(dto: CheckOutDto): Promise~WorkSession~
        +getDailyWorkSummaryById(workerId: string, from?: Date, to?: Date): Promise~Object~
        +registerFace(workerCode: string, buffer: Buffer): Promise~Object~
        +checkInWithFace(buffer: Buffer, siteId: string): Promise~WorkSession~
    }

    class AttendanceController {
        +checkIn(dto: CheckInDto): Promise~WorkSession~
        +checkOut(dto: CheckOutDto): Promise~WorkSession~
        +getDailySummary(workerId: string, from?: string, to?: string): Promise~Object~
        +registerFace(file: File, workerCode: string): Promise~Object~
        +checkInWithFace(file: File, siteId: string): Promise~WorkSession~
    }

    %% Auth Module
    class AuthService {
        +signup(dto: CreateUserDto): Promise~Object~
        +login(dto: LoginDto): Promise~Object~
        +validateUser(email: string, password: string): Promise~User~
        +generateToken(user: User): string
    }

    class AuthController {
        +signup(dto: CreateUserDto): Promise~Object~
        +login(dto: LoginDto): Promise~Object~
    }

    %% Access Code Module
    class AccessCode {
        +_id: ObjectId
        +code: string
        +siteId: ObjectId
        +isActive: boolean
        +createdBy: ObjectId
        +expiresAt: Date
        +createdAt: Date
        +updatedAt: Date
    }

    class CodesService {
        +generateCode(siteId: string, userId: string): Promise~AccessCode~
        +validateCode(code: string): Promise~boolean~
        +getCodesBySite(siteId: string): Promise~AccessCode[]~
    }

    %% Guards and Decorators
    class JwtAuthGuard {
        +canActivate(context: ExecutionContext): boolean
    }

    class RolesGuard {
        +canActivate(context: ExecutionContext): boolean
    }

    %% Location/WebSocket Module
    class LocationGateway {
        +handleConnection(client: Socket): void
        +handleDisconnect(client: Socket): void
        +handleLocationUpdate(data: LocationData): void
    }

    %% Relationships
    User --> UserRole : has
    UsersController --> UsersService : uses
    UsersService --> User : manages

    ConstructionSite --> User : ownedBy
    ConstructionSitesController --> ConstructionSitesService : uses
    ConstructionSitesService --> ConstructionSite : manages

    Task --> ConstructionSite : belongsTo
    Task --> User : assignedTo (many)
    Task --> User : createdBy
    Task --> TaskStatus : has
    Task --> TaskPriority : has
    TasksController --> TasksService : uses
    TasksService --> Task : manages

    WorkSession --> User : belongsTo (worker)
    WorkSession --> ConstructionSite : belongsTo
    WorkSession --> Location : has (checkIn/Out)
    AttendanceController --> AttendanceService : uses
    AttendanceService --> WorkSession : manages

    AccessCode --> ConstructionSite : belongsTo
    AccessCode --> User : createdBy
    CodesService --> AccessCode : manages

    AuthController --> AuthService : uses
    AuthService --> UsersService : uses
    AuthService --> User : validates

    TasksController --> JwtAuthGuard : protected by
    TasksController --> RolesGuard : protected by
    ConstructionSitesController --> JwtAuthGuard : protected by
    UsersController --> JwtAuthGuard : protected by
```

## Detailed Task Management Flow

```mermaid
classDiagram
    class CreateTaskDto {
        +title: string
        +description: string
        +constructionSiteId: string
        +status: TaskStatus
        +priority: TaskPriority
        +assignedWorkers: string[]
        +startDate: string
        +dueDate: string
        +progressPercentage: number
        +estimatedHours: number
        +notes: string
    }

    class UpdateTaskDto {
        +title?: string
        +description?: string
        +status?: TaskStatus
        +priority?: TaskPriority
        +assignedWorkers?: string[]
        +dueDate?: string
        +completedDate?: string
        +actualHours?: number
        +notes?: string
    }

    class AssignWorkersDto {
        +workerIds: string[]
    }

    class UpdateProgressDto {
        +progressPercentage: number
        +notes?: string
    }

    class Task {
        +_id: ObjectId
        +title: string
        +description: string
        +constructionSiteId: ObjectId
        +status: TaskStatus
        +priority: TaskPriority
        +assignedWorkers: ObjectId[]
        +startDate: Date
        +dueDate: Date
        +completedDate: Date
        +progressPercentage: number
        +estimatedHours: number
        +actualHours: number
        +notes: string
        +createdBy: ObjectId
    }

    class TasksService {
        -taskModel: Model~Task~
        +create(dto: CreateTaskDto, userId: string): Promise~Task~
        +findAll(): Promise~Task[]~
        +findOne(id: string): Promise~Task~
        +update(id: string, dto: UpdateTaskDto): Promise~Task~
        +updateProgress(id: string, dto: UpdateProgressDto): Promise~Task~
        +assignWorkers(id: string, workerIds: string[]): Promise~Task~
        +getTaskStats(siteId?: string): Promise~Object~
    }

    class TasksController {
        -tasksService: TasksService
        +create(dto: CreateTaskDto): Promise~Task~
        +findAll(): Promise~Task[]~
        +update(id: string, dto: UpdateTaskDto): Promise~Task~
        +updateProgress(id: string, dto: UpdateProgressDto): Promise~Task~
        +assignWorkers(id: string, dto: AssignWorkersDto): Promise~Task~
    }

    TasksController --> CreateTaskDto : receives
    TasksController --> UpdateTaskDto : receives
    TasksController --> AssignWorkersDto : receives
    TasksController --> UpdateProgressDto : receives
    TasksController --> TasksService : uses
    TasksService --> Task : manages
    CreateTaskDto ..> Task : creates
    UpdateTaskDto ..> Task : updates
```

## Authentication & Authorization Flow

```mermaid
classDiagram
    class User {
        +_id: ObjectId
        +name: string
        +email: string
        +password: string (hashed)
        +role: UserRole
    }

    class UserRole {
        <<enumeration>>
        OWNER
        CONSTRUCTION_MANAGER
        WORKER
    }

    class AuthService {
        -usersService: UsersService
        -jwtService: JwtService
        +signup(dto: CreateUserDto): Promise~Token~
        +login(email: string, password: string): Promise~Token~
        +validateUser(email: string, password: string): Promise~User~
        -hashPassword(password: string): Promise~string~
        -comparePassword(plain: string, hashed: string): Promise~boolean~
    }

    class JwtAuthGuard {
        -jwtService: JwtService
        +canActivate(context: ExecutionContext): boolean
        -extractToken(request: Request): string
        -verifyToken(token: string): Object
    }

    class RolesGuard {
        -reflector: Reflector
        -jwtService: JwtService
        +canActivate(context: ExecutionContext): boolean
        -extractRequiredRoles(context: ExecutionContext): UserRole[]
        -validateUserRole(user: User, roles: UserRole[]): boolean
    }

    class Roles {
        <<decorator>>
        +roles: UserRole[]
    }

    User --> UserRole : has
    AuthService --> User : validates
    JwtAuthGuard --> User : authenticates
    RolesGuard --> User : authorizes
    RolesGuard --> Roles : reads
    RolesGuard --> UserRole : checks
```

## Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ CONSTRUCTION_SITE : owns
    USER ||--o{ TASK : creates
    USER ||--o{ WORK_SESSION : has
    USER }o--o{ TASK : assigned_to
    USER ||--o{ ACCESS_CODE : generates
    
    CONSTRUCTION_SITE ||--o{ TASK : contains
    CONSTRUCTION_SITE ||--o{ WORK_SESSION : hosts
    CONSTRUCTION_SITE ||--o{ ACCESS_CODE : has

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        enum role
        string phoneNumber
        date createdAt
        date updatedAt
    }

    CONSTRUCTION_SITE {
        ObjectId _id PK
        string name
        string location
        string description
        ObjectId ownerId FK
        date startDate
        date endDate
        string status
        date createdAt
        date updatedAt
    }

    TASK {
        ObjectId _id PK
        string title
        string description
        ObjectId constructionSiteId FK
        enum status
        enum priority
        array assignedWorkers FK
        date startDate
        date dueDate
        date completedDate
        number progressPercentage
        number estimatedHours
        number actualHours
        string notes
        ObjectId createdBy FK
        date createdAt
        date updatedAt
    }

    WORK_SESSION {
        ObjectId _id PK
        ObjectId workerId FK
        ObjectId siteId FK
        date checkInTime
        date checkOutTime
        object checkInLocation
        object checkOutLocation
        number totalHours
        string status
        date createdAt
        date updatedAt
    }

    ACCESS_CODE {
        ObjectId _id PK
        string code UK
        ObjectId siteId FK
        boolean isActive
        ObjectId createdBy FK
        date expiresAt
        date createdAt
        date updatedAt
    }
```

## Module Dependencies

```mermaid
graph TD
    A[AppModule] --> B[AuthModule]
    A --> C[UsersModule]
    A --> D[ConstructionSitesModule]
    A --> E[TasksModule]
    A --> F[AttendanceModule]
    A --> G[LocationModule]
    A --> H[CodesModule]
    A --> I[EmailModule]
    A --> J[ConfigModule]
    A --> K[MongooseModule]
    A --> L[JwtModule]

    B --> C
    B --> L
    D --> C
    E --> C
    E --> D
    F --> C
    F --> D
    H --> D
    H --> C

    style A fill:#f9f,stroke:#333,stroke-width:4px
    style E fill:#bbf,stroke:#333,stroke-width:2px
```

## Legend

- **Blue boxes**: Recently added Task Management Module
- **Pink box**: Main Application Module
- **Arrows**: Dependencies and relationships
- **FK**: Foreign Key relationship
- **PK**: Primary Key
- **UK**: Unique Key


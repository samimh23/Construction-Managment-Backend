# Construction Management System - Domain Class Diagram

## Pure Business Domain Model (No Services/Controllers)

```mermaid
classDiagram
    %% Core Business Entities
    
    class User {
        -ObjectId id
        -string firstName
        -string lastName
        -string email
        -string password
        -UserRole role
        -string phonenumber
        -string workerCode
        -string jobTitle
        -boolean isActive
        -ObjectId assignedSite
        -Date createdAt
        +login()
        +updateProfile()
        +checkIn()
        +checkOut()
    }

    class UserRole {
        <<enumeration>>
        OWNER
        CONSTRUCTION_MANAGER
        WORKER
    }

    class ConstructionSite {
        -ObjectId id
        -string name
        -string adresse
        -Object GeoLocation
        -Object GeoFence
        -Date StartDate
        -Date EndDate
        -string Budget
        -boolean isActive
        -ObjectId owner
        -ObjectId manager
        -ObjectId[] workers
        +getTasks()
        +getWorkers()
        +calculateProgress()
        +addWorker()
        +setManager()
    }

    class Task {
        -ObjectId id
        -string title
        -string description
        -TaskStatus status
        -TaskPriority priority
        -Date startDate
        -Date dueDate
        -Date completedDate
        -number progressPercentage
        -number estimatedHours
        -number actualHours
        -string notes
        +assignWorker(worker)
        +updateProgress(percentage)
        +markCompleted()
        +isOverdue()
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

    class WorkSession {
        -ObjectId id
        -ObjectId worker
        -Date checkIn
        -Date checkOut
        -ObjectId site
        -Date createdAt
        +start()
        +end()
        +getDuration()
    }

    class Location {
        -number latitude
        -number longitude
        -string address
        +getDistance(otherLocation)
        +isWithinRadius(center, radius)
    }

    class AccessCode {
        -ObjectId id
        -string code
        -ObjectId manager
        -ObjectId site
        -Date expiresAt
        -boolean isUsed
        -ObjectId createdBy
        +validate()
        +markUsed()
        +isExpired()
    }

    %% Relationships
    User "1" --> "1" UserRole : has
    User "1" --> "0..*" ConstructionSite : owns
    User "1" --> "0..*" Task : creates
    User "0..*" --> "0..*" Task : assignedTo
    User "1" --> "0..*" WorkSession : performs
    User "1" --> "0..*" AccessCode : generates
    
    ConstructionSite "1" --> "0..*" Task : contains
    ConstructionSite "1" --> "0..*" WorkSession : hosts
    ConstructionSite "1" --> "0..*" AccessCode : has
    
    Task "1" --> "1" TaskStatus : has
    Task "1" --> "1" TaskPriority : has
    Task "1" --> "1" ConstructionSite : belongsTo
    Task "1" --> "1" User : createdBy
    
    WorkSession "1" --> "1" User : worker
    WorkSession "1" --> "1" ConstructionSite : site
    WorkSession "1" --> "2" Location : checkInOut
    
    AccessCode "1" --> "1" ConstructionSite : for
    AccessCode "1" --> "1" User : createdBy

    %% Notes
    note for User "Can be Owner, Manager, or Worker.\nEach role has different permissions."
    note for Task "Tracks work items at construction sites.\nCan be assigned to multiple workers."
    note for WorkSession "Records worker attendance.\nTracks check-in/out with location."
```

## Simplified Entity Relationship (No Technical Classes)

```mermaid
classDiagram
    class User {
        +name: string
        +email: string
        +role: enum
        +phoneNumber: string
    }

    class ConstructionSite {
        +name: string
        +location: string
        +description: string
        +startDate: Date
        +endDate: Date
    }

    class Task {
        +title: string
        +description: string
        +status: enum
        +priority: enum
        +progress: number
        +dueDate: Date
    }

    class WorkSession {
        +checkInTime: Date
        +checkOutTime: Date
        +totalHours: number
    }

    class AccessCode {
        +code: string
        +isActive: boolean
        +expiresAt: Date
    }

    %% Clean Relationships
    User "1" -- "many" ConstructionSite : owns >
    User "1" -- "many" Task : creates >
    User "many" -- "many" Task : works on >
    User "1" -- "many" WorkSession : has >
    
    ConstructionSite "1" -- "many" Task : has >
    ConstructionSite "1" -- "many" WorkSession : tracks >
    ConstructionSite "1" -- "many" AccessCode : protected by >
```

## Entity-Only Diagram (Just the Data)

```mermaid
erDiagram
    USER ||--o{ CONSTRUCTION_SITE : "owns"
    USER ||--o{ TASK : "creates"
    USER }o--o{ TASK : "works on"
    USER ||--o{ WORK_SESSION : "performs"
    USER ||--o{ ACCESS_CODE : "generates"
    
    CONSTRUCTION_SITE ||--o{ TASK : "contains"
    CONSTRUCTION_SITE ||--o{ WORK_SESSION : "tracks"
    CONSTRUCTION_SITE ||--o{ ACCESS_CODE : "secures"

    USER {
        string name
        string email
        enum role
        string phone
    }

    CONSTRUCTION_SITE {
        string name
        string location
        string description
        date startDate
        date endDate
    }

    TASK {
        string title
        string description
        enum status
        enum priority
        number progress
        date dueDate
        number estimatedHours
    }

    WORK_SESSION {
        date checkInTime
        date checkOutTime
        number totalHours
        object location
    }

    ACCESS_CODE {
        string code
        boolean isActive
        date expiresAt
    }
```

## Domain Model with Behaviors

```mermaid
classDiagram
    class User {
        +name
        +email
        +role
        +phoneNumber
        ---
        +createSite()
        +assignTask()
        +checkIn()
        +checkOut()
    }

    class ConstructionSite {
        +name
        +location
        +startDate
        +endDate
        ---
        +addTask()
        +getProgress()
        +listWorkers()
    }

    class Task {
        +title
        +status
        +priority
        +progress
        +dueDate
        ---
        +assign(worker)
        +updateProgress()
        +complete()
        +cancel()
    }

    class WorkSession {
        +checkInTime
        +checkOutTime
        +totalHours
        ---
        +start(location)
        +end(location)
        +getDuration()
    }

    User "1" --> "*" ConstructionSite
    User "1" --> "*" Task
    ConstructionSite "1" --> "*" Task
    User "1" --> "*" WorkSession
    ConstructionSite "1" --> "*" WorkSession
```

## Key Entities and Their Responsibilities

| Entity | Responsibility | Key Attributes |
|--------|---------------|----------------|
| **User** | People in the system (owners, managers, workers) | name, email, role |
| **ConstructionSite** | Physical construction locations | name, location, dates |
| **Task** | Work items to be completed | title, status, priority, progress |
| **WorkSession** | Worker attendance record | checkIn/Out times, hours |
| **AccessCode** | Security codes for site access | code, expiration |

## Relationships Explained

1. **User → ConstructionSite** (1:many)
   - One Owner owns many Construction Sites

2. **User → Task** (many:many)
   - One Manager creates many Tasks
   - Many Workers can be assigned to many Tasks

3. **ConstructionSite → Task** (1:many)
   - One Site contains many Tasks

4. **User → WorkSession** (1:many)
   - One Worker has many Work Sessions

5. **ConstructionSite → WorkSession** (1:many)
   - One Site tracks many Work Sessions

## Business Rules

```mermaid
graph LR
    A[User with OWNER role] -->|creates| B[Construction Site]
    B -->|contains| C[Tasks]
    D[User with MANAGER role] -->|creates & assigns| C
    E[User with WORKER role] -->|works on| C
    E -->|performs| F[Work Sessions]
    F -->|at| B
    B -->|secured by| G[Access Codes]
```

**Notes:**
- Only **Owners** can create Construction Sites
- Only **Owners/Managers** can create and assign Tasks
- **Workers** can update task progress and perform work sessions
- All work sessions are linked to both a worker and a site
- Access codes control entry to construction sites


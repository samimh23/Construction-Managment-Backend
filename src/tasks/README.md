# Tasks Management Module

## Overview
The Tasks Management module allows you to create, assign, and track tasks/milestones for construction sites. Tasks can be assigned to workers, tracked for progress, and organized by priority and status.

## Features

### ✅ Core Functionality
- Create tasks with detailed information
- Assign tasks to multiple workers
- Track task progress (0-100%)
- Set priorities (Low, Medium, High, Urgent)
- Track task status (Not Started, In Progress, On Hold, Completed, Cancelled)
- Set deadlines and track overdue tasks
- Estimate and track actual work hours
- Get task statistics and analytics

### 🔐 Role-Based Access Control
- **Owners & Construction Managers**: Can create, update, assign, and delete tasks
- **Workers**: Can view their assigned tasks and update progress
- **All authenticated users**: Can view tasks

## API Endpoints

### Create a Task
```http
POST /tasks
Authorization: Bearer {token}
Roles: Owner, Construction Manager
```

**Request Body:**
```json
{
  "title": "Install electrical wiring",
  "description": "Install wiring for the entire first floor",
  "constructionSiteId": "site_id_here",
  "priority": "high",
  "assignedWorkers": ["worker_id_1", "worker_id_2"],
  "startDate": "2025-11-01T08:00:00Z",
  "dueDate": "2025-11-10T17:00:00Z",
  "estimatedHours": 40,
  "notes": "Use copper wiring only"
}
```

### Get All Tasks
```http
GET /tasks
Authorization: Bearer {token}
```

### Get Task by ID
```http
GET /tasks/:id
Authorization: Bearer {token}
```

### Get Tasks by Construction Site
```http
GET /tasks/by-site/:siteId
Authorization: Bearer {token}
```

### Get Tasks by Worker
```http
GET /tasks/by-worker/:workerId
Authorization: Bearer {token}
```

### Get Tasks by Status
```http
GET /tasks/by-status/:status
Authorization: Bearer {token}
```

Status values: `not_started`, `in_progress`, `on_hold`, `completed`, `cancelled`

### Get Overdue Tasks
```http
GET /tasks/overdue
Authorization: Bearer {token}
```

### Get Task Statistics
```http
GET /tasks/stats?siteId=optional_site_id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total": 50,
  "completed": 30,
  "overdue": 5,
  "completionRate": 60,
  "byStatus": [
    { "_id": "completed", "count": 30 },
    { "_id": "in_progress", "count": 15 },
    { "_id": "not_started", "count": 5 }
  ],
  "byPriority": [
    { "_id": "high", "count": 20 },
    { "_id": "medium", "count": 25 },
    { "_id": "low", "count": 5 }
  ]
}
```

### Update Task
```http
PATCH /tasks/:id
Authorization: Bearer {token}
Roles: Owner, Construction Manager
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "urgent",
  "dueDate": "2025-11-15T17:00:00Z",
  "actualHours": 35
}
```

### Update Task Progress
```http
PATCH /tasks/:id/progress
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "progressPercentage": 75,
  "notes": "Completed 3 out of 4 rooms"
}
```

**Note:** Progress updates automatically change status:
- 0% → Not Started
- 1-99% → In Progress
- 100% → Completed (with completion date)

### Update Task Status
```http
PATCH /tasks/:id/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "on_hold"
}
```

### Assign Workers to Task
```http
PATCH /tasks/:id/assign
Authorization: Bearer {token}
Roles: Owner, Construction Manager
```

**Request Body:**
```json
{
  "workerIds": ["worker_id_1", "worker_id_2", "worker_id_3"]
}
```

### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer {token}
Roles: Owner, Construction Manager
```

## Data Models

### Task Schema
```typescript
{
  title: string;                    // Required
  description: string;
  constructionSiteId: ObjectId;     // Required, references ConstructionSite
  status: TaskStatus;               // Default: 'not_started'
  priority: TaskPriority;           // Default: 'medium'
  assignedWorkers: ObjectId[];      // References User (workers)
  startDate: Date;
  dueDate: Date;
  completedDate: Date;
  progressPercentage: number;       // 0-100, Default: 0
  estimatedHours: number;
  actualHours: number;
  notes: string;
  createdBy: ObjectId;              // References User (creator)
  createdAt: Date;                  // Auto-generated
  updatedAt: Date;                  // Auto-generated
}
```

### Enums

**TaskStatus:**
- `not_started`
- `in_progress`
- `on_hold`
- `completed`
- `cancelled`

**TaskPriority:**
- `low`
- `medium`
- `high`
- `urgent`

## Usage Examples

### 1. Create a High-Priority Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pour foundation for building A",
    "description": "Pour concrete foundation according to blueprint specs",
    "constructionSiteId": "67890abcdef",
    "priority": "high",
    "assignedWorkers": ["worker123", "worker456"],
    "startDate": "2025-11-01",
    "dueDate": "2025-11-05",
    "estimatedHours": 80
  }'
```

### 2. Update Task Progress
```bash
curl -X PATCH http://localhost:3000/tasks/task_id/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progressPercentage": 50,
    "notes": "Foundation forms are set, ready for concrete"
  }'
```

### 3. Get All Tasks for a Construction Site
```bash
curl -X GET http://localhost:3000/tasks/by-site/site_id_here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Tasks Assigned to a Worker
```bash
curl -X GET http://localhost:3000/tasks/by-worker/worker_id_here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Statistics for a Site
```bash
curl -X GET http://localhost:3000/tasks/stats?siteId=site_id_here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Best Practices

1. **Set Realistic Deadlines**: Always set `dueDate` to track project timelines
2. **Track Hours**: Use `estimatedHours` and `actualHours` for budget planning
3. **Update Progress Regularly**: Workers should update progress daily
4. **Use Priorities**: Assign appropriate priorities to help workers focus
5. **Monitor Overdue Tasks**: Check `/tasks/overdue` endpoint regularly
6. **Add Notes**: Use notes field for important updates and context

## Integration with Other Modules

- **Construction Sites**: Tasks must be linked to a construction site
- **Users**: Tasks are created by managers and assigned to workers
- **Attendance**: Can be correlated with task progress

## Validation Rules

- `title`: Required, must be a string
- `constructionSiteId`: Required, must be a valid MongoDB ObjectId
- `progressPercentage`: Must be between 0 and 100
- `estimatedHours` and `actualHours`: Must be positive numbers
- `assignedWorkers`: Each ID must be a valid MongoDB ObjectId
- `status`: Must be one of the defined TaskStatus values
- `priority`: Must be one of the defined TaskPriority values

## Error Handling

The module returns appropriate HTTP status codes:
- `200`: Success
- `201`: Task created successfully
- `400`: Bad request (invalid data)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Task not found

## Future Enhancements (Not Yet Implemented)

- Task dependencies (blocked by/blocking relationships)
- Task comments/activity log
- File attachments (photos, documents)
- Task templates
- Recurring tasks
- Subtasks
- Time tracking integration
- Notifications for overdue tasks

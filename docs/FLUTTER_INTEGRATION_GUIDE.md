# 📱 Flutter Mobile App - Task Management Integration Guide

## 🎯 Overview

I've added a **complete Task Management Module** to the backend. Here's what you need to implement in the Flutter mobile app.

---

## 🆕 NEW BACKEND FEATURES

### 1. Task Management System
- Create and assign tasks to workers
- Track task progress (0-100%)
- Set priorities (Low, Medium, High, Urgent)
- Set deadlines and track overdue tasks
- Update task status (Not Started, In Progress, On Hold, Completed, Cancelled)
- Get task statistics and analytics

--- 

## 📡 API ENDPOINTS TO INTEGRATE

### Base URL
```
http://your-backend-url:3000
```

### Authentication
All endpoints require JWT token in header:
```dart
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

---

## 📋 TASK ENDPOINTS

### 1. Get All Tasks
```http
GET /tasks
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Install electrical wiring",
    "description": "Install wiring for the entire first floor",
    "constructionSiteId": {
      "_id": "site123",
      "name": "Building A",
      "location": "Downtown"
    },
    "status": "in_progress",
    "priority": "high",
    "assignedWorkers": [
      {
        "_id": "worker123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    ],
    "startDate": "2025-11-01T08:00:00Z",
    "dueDate": "2025-11-10T17:00:00Z",
    "completedDate": null,
    "progressPercentage": 45,
    "estimatedHours": 40,
    "actualHours": 20,
    "notes": "Use copper wiring only",
    "createdBy": {
      "_id": "manager123",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "createdAt": "2025-10-25T10:00:00Z",
    "updatedAt": "2025-10-31T14:30:00Z"
  }
]
```

### 2. Get Tasks for Specific Construction Site
```http
GET /tasks/by-site/:siteId
```

### 3. Get Tasks Assigned to Worker
```http
GET /tasks/by-worker/:workerId
```

**Use this to show workers their assigned tasks!**

### 4. Get Tasks by Status
```http
GET /tasks/by-status/:status
```

Status values: `not_started`, `in_progress`, `on_hold`, `completed`, `cancelled`

### 5. Get Overdue Tasks
```http
GET /tasks/overdue
```

**Use this to show alerts!**

### 6. Get Task Statistics
```http
GET /tasks/stats?siteId=optional_site_id
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

**Use this for dashboard charts!**

### 7. Get Single Task
```http
GET /tasks/:id
```

### 8. Create Task (Manager/Owner Only)
```http
POST /tasks
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

**Required fields:** `title`, `constructionSiteId`

### 9. Update Task Progress (All Users)
```http
PATCH /tasks/:id/progress
```

**Request Body:**
```json
{
  "progressPercentage": 75,
  "notes": "Completed 3 out of 4 rooms"
}
```

**Important:** Progress updates automatically change status:
- 0% → `not_started`
- 1-99% → `in_progress`
- 100% → `completed` (sets completedDate automatically)

### 10. Update Task Status
```http
PATCH /tasks/:id/status
```

**Request Body:**
```json
{
  "status": "on_hold"
}
```

### 11. Update Task (Manager/Owner Only)
```http
PATCH /tasks/:id
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

### 12. Assign Workers to Task (Manager/Owner Only)
```http
PATCH /tasks/:id/assign
```

**Request Body:**
```json
{
  "workerIds": ["worker_id_1", "worker_id_2", "worker_id_3"]
}
```

### 13. Delete Task (Manager/Owner Only)
```http
DELETE /tasks/:id
```

---

## 🎨 FLUTTER DATA MODELS

### Task Model
```dart
class Task {
  final String id;
  final String title;
  final String? description;
  final ConstructionSite constructionSite;
  final TaskStatus status;
  final TaskPriority priority;
  final List<User> assignedWorkers;
  final DateTime? startDate;
  final DateTime? dueDate;
  final DateTime? completedDate;
  final int progressPercentage;
  final double? estimatedHours;
  final double? actualHours;
  final String? notes;
  final User createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.constructionSite,
    required this.status,
    required this.priority,
    required this.assignedWorkers,
    this.startDate,
    this.dueDate,
    this.completedDate,
    this.progressPercentage = 0,
    this.estimatedHours,
    this.actualHours,
    this.notes,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      constructionSite: ConstructionSite.fromJson(json['constructionSiteId']),
      status: TaskStatus.fromString(json['status']),
      priority: TaskPriority.fromString(json['priority']),
      assignedWorkers: (json['assignedWorkers'] as List?)
          ?.map((w) => User.fromJson(w))
          .toList() ?? [],
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : null,
      completedDate: json['completedDate'] != null ? DateTime.parse(json['completedDate']) : null,
      progressPercentage: json['progressPercentage'] ?? 0,
      estimatedHours: json['estimatedHours']?.toDouble(),
      actualHours: json['actualHours']?.toDouble(),
      notes: json['notes'],
      createdBy: User.fromJson(json['createdBy']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'constructionSiteId': constructionSite.id,
      'status': status.value,
      'priority': priority.value,
      'assignedWorkers': assignedWorkers.map((w) => w.id).toList(),
      'startDate': startDate?.toIso8601String(),
      'dueDate': dueDate?.toIso8601String(),
      'progressPercentage': progressPercentage,
      'estimatedHours': estimatedHours,
      'actualHours': actualHours,
      'notes': notes,
    };
  }

  bool get isOverdue {
    if (dueDate == null) return false;
    if (status == TaskStatus.completed || status == TaskStatus.cancelled) return false;
    return DateTime.now().isAfter(dueDate!);
  }
}
```

### Task Status Enum
```dart
enum TaskStatus {
  notStarted('not_started', 'Not Started'),
  inProgress('in_progress', 'In Progress'),
  onHold('on_hold', 'On Hold'),
  completed('completed', 'Completed'),
  cancelled('cancelled', 'Cancelled');

  final String value;
  final String label;

  const TaskStatus(this.value, this.label);

  static TaskStatus fromString(String value) {
    return TaskStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => TaskStatus.notStarted,
    );
  }

  Color get color {
    switch (this) {
      case TaskStatus.notStarted:
        return Colors.grey;
      case TaskStatus.inProgress:
        return Colors.blue;
      case TaskStatus.onHold:
        return Colors.orange;
      case TaskStatus.completed:
        return Colors.green;
      case TaskStatus.cancelled:
        return Colors.red;
    }
  }

  IconData get icon {
    switch (this) {
      case TaskStatus.notStarted:
        return Icons.radio_button_unchecked;
      case TaskStatus.inProgress:
        return Icons.play_circle_outline;
      case TaskStatus.onHold:
        return Icons.pause_circle_outline;
      case TaskStatus.completed:
        return Icons.check_circle;
      case TaskStatus.cancelled:
        return Icons.cancel;
    }
  }
}
```

### Task Priority Enum
```dart
enum TaskPriority {
  low('low', 'Low'),
  medium('medium', 'Medium'),
  high('high', 'High'),
  urgent('urgent', 'Urgent');

  final String value;
  final String label;

  const TaskPriority(this.value, this.label);

  static TaskPriority fromString(String value) {
    return TaskPriority.values.firstWhere(
      (e) => e.value == value,
      orElse: () => TaskPriority.medium,
    );
  }

  Color get color {
    switch (this) {
      case TaskPriority.low:
        return Colors.green;
      case TaskPriority.medium:
        return Colors.blue;
      case TaskPriority.high:
        return Colors.orange;
      case TaskPriority.urgent:
        return Colors.red;
    }
  }

  IconData get icon {
    switch (this) {
      case TaskPriority.low:
        return Icons.low_priority;
      case TaskPriority.medium:
        return Icons.remove;
      case TaskPriority.high:
        return Icons.priority_high;
      case TaskPriority.urgent:
        return Icons.warning;
    }
  }
}
```

### Task Statistics Model
```dart
class TaskStats {
  final int total;
  final int completed;
  final int overdue;
  final double completionRate;
  final Map<String, int> byStatus;
  final Map<String, int> byPriority;

  TaskStats({
    required this.total,
    required this.completed,
    required this.overdue,
    required this.completionRate,
    required this.byStatus,
    required this.byPriority,
  });

  factory TaskStats.fromJson(Map<String, dynamic> json) {
    return TaskStats(
      total: json['total'],
      completed: json['completed'],
      overdue: json['overdue'],
      completionRate: json['completionRate'].toDouble(),
      byStatus: Map.fromIterable(
        json['byStatus'],
        key: (item) => item['_id'],
        value: (item) => item['count'],
      ),
      byPriority: Map.fromIterable(
        json['byPriority'],
        key: (item) => item['_id'],
        value: (item) => item['count'],
      ),
    );
  }
}
```

---

## 🔌 FLUTTER SERVICE/REPOSITORY

```dart
class TaskRepository {
  final String baseUrl;
  final String token;

  TaskRepository({required this.baseUrl, required this.token});

  // Get all tasks
  Future<List<Task>> getAllTasks() async {
    final response = await http.get(
      Uri.parse('$baseUrl/tasks'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Task.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tasks');
    }
  }

  // Get tasks by worker
  Future<List<Task>> getTasksByWorker(String workerId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/tasks/by-worker/$workerId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Task.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tasks');
    }
  }

  // Get tasks by construction site
  Future<List<Task>> getTasksBySite(String siteId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/tasks/by-site/$siteId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Task.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load tasks');
    }
  }

  // Get overdue tasks
  Future<List<Task>> getOverdueTasks() async {
    final response = await http.get(
      Uri.parse('$baseUrl/tasks/overdue'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Task.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load overdue tasks');
    }
  }

  // Get task statistics
  Future<TaskStats> getTaskStats({String? siteId}) async {
    final uri = siteId != null
        ? Uri.parse('$baseUrl/tasks/stats?siteId=$siteId')
        : Uri.parse('$baseUrl/tasks/stats');

    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return TaskStats.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load task stats');
    }
  }

  // Create task
  Future<Task> createTask(Task task) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tasks'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode(task.toJson()),
    );

    if (response.statusCode == 201) {
      return Task.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create task');
    }
  }

  // Update task progress
  Future<Task> updateProgress(String taskId, int progress, {String? notes}) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/tasks/$taskId/progress'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'progressPercentage': progress,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      return Task.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to update progress');
    }
  }

  // Update task status
  Future<Task> updateStatus(String taskId, TaskStatus status) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/tasks/$taskId/status'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({'status': status.value}),
    );

    if (response.statusCode == 200) {
      return Task.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to update status');
    }
  }

  // Delete task
  Future<void> deleteTask(String taskId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/tasks/$taskId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete task');
    }
  }
}
```

---

## 🎨 UI SCREENS TO IMPLEMENT

### 1. **Worker View - My Tasks Screen**
Show tasks assigned to logged-in worker:
- List of assigned tasks
- Filter by status (In Progress, Not Started, etc.)
- Sort by priority or due date
- Show overdue badge
- Click to see task details

### 2. **Task Details Screen**
Show full task information:
- Title, description
- Construction site
- Status badge with color
- Priority badge with color
- Progress bar (0-100%)
- Due date (with overdue warning if past due)
- Assigned workers
- Estimated vs actual hours
- Notes section
- **Action: Update Progress slider**

### 3. **Manager View - All Tasks Screen**
Show all tasks with management capabilities:
- Create new task button
- List all tasks
- Filter by site, status, priority
- Search by title
- Assign workers
- Edit tasks
- Delete tasks

### 4. **Task Statistics Dashboard**
Visual charts showing:
- Total tasks
- Completion rate (circular progress)
- Tasks by status (pie chart)
- Tasks by priority (bar chart)
- Overdue tasks count (alert badge)

### 5. **Create/Edit Task Form**
Form fields:
- Title (required)
- Description
- Construction Site (dropdown, required)
- Priority (dropdown)
- Start Date (date picker)
- Due Date (date picker)
- Estimated Hours (number input)
- Assign Workers (multi-select)
- Notes (text area)

---

## 🎯 KEY FEATURES TO IMPLEMENT

### For Workers:
✅ View assigned tasks  
✅ Update task progress with slider (0-100%)  
✅ Add notes when updating progress  
✅ See which tasks are overdue  
✅ Filter tasks by status  

### For Managers/Owners:
✅ Create new tasks  
✅ Assign tasks to multiple workers  
✅ Edit task details  
✅ Delete tasks  
✅ View task statistics and charts  
✅ See all tasks across all sites  

### For Everyone:
✅ See task status with color badges  
✅ See priority levels  
✅ See construction site for each task  
✅ See assigned workers  
✅ See progress percentage  
✅ See overdue warnings  

---

## 🔔 NOTIFICATIONS TO ADD

### Push Notifications for:
1. **New Task Assigned** - "You've been assigned to: Install electrical wiring"
2. **Task Due Soon** - "Task 'Install plumbing' is due in 2 days"
3. **Task Overdue** - "Task 'Paint walls' is overdue!"
4. **Task Completed** - "Great! Task 'Install doors' marked complete"

---

## 📊 WIDGETS TO CREATE

### 1. Task Card Widget
```dart
TaskCard(
  task: task,
  onTap: () => navigateToDetails(task),
  showSite: true,
  showWorkers: true,
)
```

### 2. Progress Slider Widget
```dart
TaskProgressSlider(
  initialProgress: task.progressPercentage,
  onProgressChanged: (value) => updateProgress(task.id, value),
)
```

### 3. Status Badge Widget
```dart
StatusBadge(status: task.status)
```

### 4. Priority Badge Widget
```dart
PriorityBadge(priority: task.priority)
```

### 5. Overdue Warning Widget
```dart
OverdueWarning(dueDate: task.dueDate, status: task.status)
```

---

## 🎨 COLOR SCHEME

### Status Colors:
- Not Started: `Colors.grey`
- In Progress: `Colors.blue`
- On Hold: `Colors.orange`
- Completed: `Colors.green`
- Cancelled: `Colors.red`

### Priority Colors:
- Low: `Colors.green`
- Medium: `Colors.blue`
- High: `Colors.orange`
- Urgent: `Colors.red`

---

## ✅ TESTING CHECKLIST

- [ ] Worker can see their assigned tasks
- [ ] Worker can update task progress
- [ ] Progress update changes status automatically
- [ ] Manager can create new tasks
- [ ] Manager can assign multiple workers
- [ ] Manager can edit tasks
- [ ] Manager can delete tasks
- [ ] Overdue tasks show warning
- [ ] Task statistics display correctly
- [ ] Filters work (status, priority, site)
- [ ] Search works
- [ ] All dates display in correct timezone
- [ ] Error handling for failed API calls
- [ ] Loading states show properly

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Essential):
1. ✅ Create Task model and enums
2. ✅ Create Task repository/service
3. ✅ Worker: View assigned tasks screen
4. ✅ Worker: Update progress feature
5. ✅ Task details screen

### Phase 2 (Important):
1. ✅ Manager: Create task form
2. ✅ Manager: All tasks screen
3. ✅ Manager: Edit/Delete tasks
4. ✅ Overdue task warnings
5. ✅ Filter and search

### Phase 3 (Nice to Have):
1. ✅ Task statistics dashboard
2. ✅ Charts and graphs
3. ✅ Push notifications
4. ✅ Advanced filters

---

**Good luck with the Flutter implementation! 🚀**

All backend endpoints are ready and tested. Just integrate with these APIs!

# 📚 Construction Management System - Documentation Index

Welcome to the documentation for the Construction Management Backend! This folder contains comprehensive class diagrams and architectural documentation.

## 📊 Available Diagrams

### 1. **CLASS_DIAGRAM.md** ⭐ MAIN DIAGRAM
**What's inside:**
- Complete system architecture with all classes
- Task Management Module details (NEW!)
- Authentication & Authorization flow
- Database Entity Relationships (ER Diagram)
- Module Dependencies graph

**Best for:** Understanding the entire system architecture

**Format:** Mermaid (renders on GitHub, VS Code with extension)

👉 **[Open CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)**

---

### 2. **PROJECT_STRUCTURE_DIAGRAM.md** 📁 QUICK OVERVIEW
**What's inside:**
- Project structure tree
- Module relationships
- Data flow examples (Creating a task, Updating progress)
- Database schema visual
- Security architecture
- Task status state machine
- API endpoints overview
- Technology stack

**Best for:** Quick understanding, onboarding new developers

**Format:** Mermaid + Text diagrams

👉 **[Open PROJECT_STRUCTURE_DIAGRAM.md](./PROJECT_STRUCTURE_DIAGRAM.md)**

---

### 3. **class-diagram.puml** 🎨 PROFESSIONAL EXPORT
**What's inside:**
- Complete UML class diagram
- Professional PlantUML format
- All entities, services, controllers
- Relationships and dependencies

**Best for:** Exporting to PNG/SVG for presentations, formal documentation

**Format:** PlantUML (requires extension or online viewer)

👉 **[Open class-diagram.puml](./class-diagram.puml)**

---

### 4. **HOW_TO_VIEW_DIAGRAMS.md** 📖 SETUP GUIDE
**What's inside:**
- 5 different methods to view diagrams
- Step-by-step installation guides
- VS Code extension setup
- Online viewers
- Swagger API documentation setup
- Troubleshooting tips

**Best for:** First-time setup, learning how to view diagrams

**Format:** Markdown tutorial

👉 **[Open HOW_TO_VIEW_DIAGRAMS.md](./HOW_TO_VIEW_DIAGRAMS.md)**

---

### 5. **DIAGRAM_SUMMARY.md** 🚀 QUICK START
**What's inside:**
- Quick 2-step viewing guide
- What's in each diagram
- Interactive API docs info
- Use cases and next steps

**Best for:** Getting started quickly

**Format:** Markdown guide

👉 **[Open DIAGRAM_SUMMARY.md](./DIAGRAM_SUMMARY.md)**

---

## 🚀 Quick Start (Choose Your Path)

### Path 1: I want to see the diagrams RIGHT NOW! ⚡
1. Go to **[Mermaid Live Editor](https://mermaid.live)**
2. Open `CLASS_DIAGRAM.md`
3. Copy any diagram code (between \`\`\`mermaid and \`\`\`)
4. Paste and view!

### Path 2: I want to view in VS Code 💻
1. Install **"Markdown Preview Mermaid Support"** extension
2. Open `CLASS_DIAGRAM.md`
3. Press `Ctrl+Shift+V`

### Path 3: I want interactive API docs 🌐
1. Run: `npm run start:dev`
2. Open: http://localhost:3000/api
3. Explore your APIs!

### Path 4: I want professional exports 📊
1. Install **"PlantUML"** extension in VS Code
2. Open `class-diagram.puml`
3. Press `Alt+D` to preview
4. Right-click → Export to PNG/SVG

---

## 📋 What Each Diagram Shows

### System Components

| Component | What It Does | Where to Find |
|-----------|--------------|---------------|
| **Users** | Authentication, roles, permissions | All diagrams |
| **Construction Sites** | Site management, ownership | All diagrams |
| **Tasks** (NEW!) | Task creation, assignment, progress tracking | All diagrams |
| **Attendance** | Check-in/out, face recognition, work hours | All diagrams |
| **Access Codes** | Site access control | CLASS_DIAGRAM.md |
| **Location** | Real-time worker tracking via WebSocket | CLASS_DIAGRAM.md |
| **Email** | Notifications and alerts | PROJECT_STRUCTURE_DIAGRAM.md |

### Relationships

| Relationship | Description | Where to Find |
|--------------|-------------|---------------|
| User → Construction Site | Ownership (one-to-many) | All ER diagrams |
| Construction Site → Task | Contains (one-to-many) | All ER diagrams |
| Task → User | Assignment (many-to-many) | All ER diagrams |
| User → Work Session | Worker attendance (one-to-many) | CLASS_DIAGRAM.md |

---

## 🎯 Use Cases

### For Developers
- **Understanding the codebase**: Start with `PROJECT_STRUCTURE_DIAGRAM.md`
- **Adding new features**: Check `CLASS_DIAGRAM.md` for existing patterns
- **Debugging**: See data flow in sequence diagrams

### For Documentation
- **Technical docs**: Export PlantUML diagrams as PNG
- **README files**: Embed Mermaid diagrams
- **API docs**: Use Swagger at `/api` endpoint

### For Presentations
- **Client demos**: Use Swagger for interactive demo
- **Team meetings**: Show `PROJECT_STRUCTURE_DIAGRAM.md`
- **Architecture review**: Export PlantUML to slides

---

## 🔄 Keeping Diagrams Updated

When you add new features:

1. **Update Mermaid diagrams** in `CLASS_DIAGRAM.md`
2. **Update PlantUML** in `class-diagram.puml`
3. **Update API list** in `PROJECT_STRUCTURE_DIAGRAM.md`
4. **Commit to Git** so everyone stays in sync

---

## 📚 Additional Documentation

### In the Project
- **Task Module README**: `../tasks/README.md`
- **Task Setup Guide**: `../TASKS_MODULE_SETUP.md`
- **Main README**: `../README.md`

### External Resources
- [Mermaid Documentation](https://mermaid.js.org/)
- [PlantUML Documentation](https://plantuml.com/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Swagger/OpenAPI](https://swagger.io/)

---

## 🆘 Need Help?

1. **Can't see diagrams?** → Check `HOW_TO_VIEW_DIAGRAMS.md`
2. **Want to export?** → See PlantUML section in viewing guide
3. **Adding new features?** → Update diagrams and commit
4. **API testing?** → Use Swagger at http://localhost:3000/api

---

## 📊 Diagram Statistics

- **Total Diagrams**: 15+
- **Formats**: Mermaid, PlantUML, ER Diagrams, Sequence Diagrams, State Machines
- **Coverage**: 100% of current modules
- **Last Updated**: October 31, 2025

---

## 🎉 Quick Tips

✅ **GitHub auto-renders Mermaid** - Just push and view!  
✅ **Swagger is already configured** - No extra setup needed  
✅ **PlantUML exports to PNG/SVG** - Great for presentations  
✅ **Keep diagrams in sync** with code changes  

---

**Happy Architecting! 🏗️🎨**

For questions or updates, check the individual diagram files or the viewing guide.

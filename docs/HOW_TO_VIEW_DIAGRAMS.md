# How to Create and View Class Diagrams

## 📊 Available Diagram Formats

I've created class diagrams for your Construction Management project in **3 formats**:

### 1. **Mermaid Diagrams** (Recommended) ✅
- **File**: `docs/CLASS_DIAGRAM.md`
- **Best for**: GitHub, GitLab, VS Code, Markdown viewers
- **No installation needed!**

### 2. **PlantUML Diagram**
- **File**: `docs/class-diagram.puml`
- **Best for**: Professional documentation, exports to PNG/SVG
- **Requires**: PlantUML extension or online viewer

---

## 🚀 Method 1: View Mermaid in VS Code (Easiest)

### Step 1: Install Mermaid Extension
```powershell
# Open VS Code extensions and search for:
# "Markdown Preview Mermaid Support" by Matt Bierner
```

Or click the Extensions icon (Ctrl+Shift+X) and search for "mermaid"

### Step 2: View the Diagram
1. Open `docs/CLASS_DIAGRAM.md` in VS Code
2. Press `Ctrl + Shift + V` (Markdown Preview)
3. See your beautiful class diagrams! 🎨

---

## 🌐 Method 2: View Mermaid Online (No Installation)

### Option A: Mermaid Live Editor
1. Go to: https://mermaid.live
2. Open `docs/CLASS_DIAGRAM.md`
3. Copy any diagram code (between \`\`\`mermaid and \`\`\`)
4. Paste into Mermaid Live Editor
5. Download as PNG or SVG

### Option B: GitHub
1. Push your code to GitHub
2. Open `docs/CLASS_DIAGRAM.md` on GitHub
3. GitHub automatically renders Mermaid diagrams!

---

## 🎨 Method 3: PlantUML (Professional Quality)

### Step 1: Install PlantUML Extension for VS Code
```powershell
# Search in VS Code extensions:
# "PlantUML" by jebbs
```

### Step 2: View PlantUML Diagram
1. Open `docs/class-diagram.puml`
2. Press `Alt + D` to preview
3. Or right-click → "Preview Current Diagram"

### Step 3: Export as Image
- Right-click in preview → Export to PNG/SVG

### Online Alternative
1. Go to: http://www.plantuml.com/plantuml/uml/
2. Copy content from `docs/class-diagram.puml`
3. Paste and view!

---

## 📦 Method 4: Auto-Generate from Code (Advanced)

### Install TypeScript Class Diagram Generator

```powershell
npm install -g tplant
```

### Generate Diagram
```powershell
# Generate PlantUML from TypeScript files
tplant --input src/**/*.ts --output docs/auto-generated-diagram.puml

# Or for specific modules
tplant --input src/tasks/**/*.ts --output docs/tasks-diagram.puml
```

---

## 🔧 Method 5: Use Swagger/OpenAPI UI

You already have `@nestjs/swagger` installed! Let's enable it:

### Step 1: Update `main.ts`

Add this to your `src/main.ts`:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Construction Management API')
    .setDescription('API documentation for Construction Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  await app.listen(3000);
}
```

### Step 2: Run Your App
```powershell
npm run start:dev
```

### Step 3: View Interactive API Documentation
Open: http://localhost:3000/api-docs

This shows all your endpoints, DTOs, and schemas visually!

---

## 📝 Quick Comparison

| Method | Installation | Quality | Interactive | Export |
|--------|-------------|---------|-------------|--------|
| Mermaid (VS Code) | Extension | Good | No | Via extension |
| Mermaid (GitHub) | None | Good | No | Screenshot |
| Mermaid (Online) | None | Good | No | PNG/SVG |
| PlantUML (VS Code) | Extension | Excellent | Preview | PNG/SVG/PDF |
| PlantUML (Online) | None | Excellent | No | PNG/SVG |
| tplant | npm install | Good | No | PlantUML |
| Swagger | Built-in | Good | Yes | Via browser |

---

## 🎯 Recommended Workflow

### For Quick Viewing:
1. **Install "Markdown Preview Mermaid Support"** in VS Code
2. Open `docs/CLASS_DIAGRAM.md`
3. Press `Ctrl + Shift + V`

### For Professional Documentation:
1. **Install "PlantUML"** extension
2. Open `docs/class-diagram.puml`
3. Press `Alt + D`
4. Export as PNG/SVG

### For API Documentation:
1. **Enable Swagger** (see Method 5 above)
2. Run `npm run start:dev`
3. Visit `http://localhost:3000/api-docs`

---

## 🖼️ What's in the Diagrams?

### 1. **Main Architecture Overview**
- All modules and their relationships
- Entities (User, Task, ConstructionSite, etc.)
- Services and Controllers
- Guards and Authentication

### 2. **Task Management Flow**
- Detailed view of the new Tasks module
- DTOs, Services, Controllers
- Data flow for task operations

### 3. **Authentication & Authorization**
- How JWT auth works
- Role-based access control
- Guards and decorators

### 4. **Database Schema Relationships**
- Entity relationships (ER diagram)
- Foreign keys and constraints
- One-to-many, many-to-many relationships

### 5. **Module Dependencies**
- How modules depend on each other
- Import hierarchy

---

## 💡 Tips

1. **Mermaid** is best for documentation that lives in Git
2. **PlantUML** is best for presentations and formal docs
3. **Swagger** is best for API consumers and testing
4. Update diagrams when you add new features!

---

## 🚨 Troubleshooting

### Mermaid not rendering in VS Code?
- Make sure you installed "Markdown Preview Mermaid Support"
- Reload VS Code window (Ctrl+Shift+P → "Reload Window")

### PlantUML not working?
- Install Java (PlantUML requires Java)
- Or use online viewer instead

### Swagger not showing?
- Check if you updated `main.ts`
- Restart the dev server

---

## 📚 Additional Resources

- **Mermaid Docs**: https://mermaid.js.org/
- **PlantUML Docs**: https://plantuml.com/
- **NestJS Swagger**: https://docs.nestjs.com/openapi/introduction
- **VS Code Mermaid**: https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid
- **VS Code PlantUML**: https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml

---

Ready to visualize your architecture! 🎨

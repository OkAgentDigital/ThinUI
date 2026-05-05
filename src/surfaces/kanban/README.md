# KanbanSurface — Three-Lane Kanban Board for GiftWrapper

## Overview

A React component that displays a three-lane Kanban board (dev, publishing, user) for the uDos task management system. Connects to the MCP task server at `localhost:30001` to fetch and update tasks in real-time.

## Features

- **Three-lane tabs**: Switch between Dev, Publishing, and User lanes
- **Drag-drop cards**: Move tasks between columns (Backlog → In Progress → Review → Done)
- **Create tasks**: Inline form with title, lane, priority, and description
- **Auto-refresh**: Polls the MCP server every 30 seconds
- **Priority badges**: Color-coded (urgent=red, high=orange, medium=blue, low=gray)
- **Card metadata**: Shows assignee, due date, and tags
- **Empty state**: Dashed drop zones when columns are empty
- **Error handling**: Banner for connection failures

## Integration

### 1. Import in your ThinUI application

```tsx
import { KanbanSurface } from './surfaces/kanban/KanbanSurface';
```

### 2. Add to routing

```tsx
<Route path="/kanban" component={KanbanSurface} />
```

### 3. Access

Open `http://localhost:3000/kanban` in your browser.

## Data Source

The component fetches data from the MCP task server:

- **Endpoint**: `POST http://localhost:30001/mcp`
- **Tools used**: `task_kanban_board`, `task_list`, `task_create`, `task_update`
- **Server**: `task_mcp_server.py` (Usync/binder/)

## Prerequisites

1. MCP task server running on port 30001:
   ```bash
   python3 ~/Code/DevStudio/Usync/binder/task_mcp_server.py
   ```

2. ThinUI dev server running:
   ```bash
   cd ~/Code/OkAgentDigital/ThinUI
   npm run dev
   ```

## Styling

- Dark theme (gray-900 background)
- Tailwind CSS classes
- Responsive 4-column grid layout
- Monospace font for technical content

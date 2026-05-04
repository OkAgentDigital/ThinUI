# ThinUI uCode Dashboard

## Overview
This React component displays the current status of uCode development tasks in a clean, retro-inspired interface.

## Features
- Task counts by column (Backlog, Planning, In Progress, Review, Done)
- Next actions display (tasks in Planning or In Progress)
- Green monospace text on black background
- Fetches data from Hivemind's `/api/board` endpoint

## Usage

### 1. Integration
Import the component in your ThinUI application:

```tsx
import { DashboardSurface } from './surfaces/dashboard/DashboardSurface';
```

### 2. Routing
Add the dashboard to your route configuration:

```tsx
<Route path="/dashboard" component={DashboardSurface} />
```

### 3. Access
Open the dashboard in your browser:
- URL: `http://localhost:3000/dashboard`
- Requires Hivemind API to be running

## Data Source
The component fetches data from:
- **Endpoint**: `/api/board`
- **Format**: JSON with `name`, `columns`, and `tasks` properties
- **Server**: Hivemind API Gateway

## Styling
- Uses Tailwind CSS classes for responsive layout
- Retro color scheme: green text on black background
- Monospace font for technical content

## Development

### Running Locally
1. Start Hivemind API:
   ```bash
   cd ~/Code/OkAgentDigital/Hivemind
   cargo run --release
   ```

2. Start ThinUI:
   ```bash
   cd ~/Code/OkAgentDigital/ThinUI
   npm start
   ```

3. Open the dashboard:
   ```bash
   open http://localhost:3000/dashboard
   ```

### Testing
- Mock the `/api/board` endpoint to test different board states
- Verify task counts update correctly when data changes
- Test responsive layout on different screen sizes
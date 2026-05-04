<<<<<<< HEAD
# ThinUI

## Overview
ThinUI is a lightweight UI framework for building web interfaces with a retro aesthetic.

## Components

### Dashboard Surface
- **File**: `src/surfaces/dashboard/DashboardSurface.tsx`
- **Purpose**: Displays uCode development progress
- **Features**:
  - Task counts by column
  - Next actions display
  - Retro-inspired interface
  - API integration with Hivemind

## Documentation
- [Dashboard Component Guide](src/surfaces/dashboard/README.md)
- [DevStudio & Cline Integration](https://github.com/your-repo/DevStudio/blob/main/ClineDevStudio.md)

## Quick Start

### 1. Start Hivemind API
```bash
cd ~/Code/OkAgentDigital/Hivemind
cargo run --release
```

### 2. Start ThinUI
```bash
cd ~/Code/OkAgentDigital/ThinUI
npm start
```

### 3. Open Dashboard
```bash
open http://localhost:3000/dashboard
```

## Development

### Running Locally
1. Start Hivemind API
2. Start ThinUI server
3. Open the dashboard in browser

### Testing
- Mock the `/api/board` endpoint
- Test different board states
- Verify responsive layout

## Related Tools
- [Hivemind API](https://github.com/your-repo/hivemind)
- [DevStudio](https://github.com/your-repo/DevStudio)
- [Cline VS Code Extension](https://marketplace.visualstudio.com/items?itemName=cline.kanban)
=======
# ThinUI - Tauri Thin UI Wrapper by OkAgentDigital

A lightweight Tauri-based UI wrapper for uDos applications, providing a modern desktop interface for the uDos platform.

## Features

- **Tauri Integration**: Lightweight Rust-based desktop application framework
- **uDos Compatibility**: Designed specifically for uDos platform integration
- **Modern UI**: Clean, responsive interface for uDos applications
- **Cross-platform**: Works on Windows, macOS, and Linux

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Architecture

- **Frontend**: Vue.js with TypeScript
- **Backend**: Tauri (Rust)
- **Styling**: Tailwind CSS with custom uDos themes
- **State Management**: Pinia for Vue state

## Development

This repository is maintained by OkAgentDigital and is part of the uDos ecosystem.

## License

MIT License - Copyright (c) 2024 OkAgentDigital
>>>>>>> origin/main

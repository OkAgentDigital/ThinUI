# ThinUI Setup Guide

## 🎯 Overview

ThinUI has been **separated** from the main uDosGo repository and established as a **standalone component** in the OkAgentDigital organization. This guide explains the setup and integration process.

## 📁 Repository Structure

```
OkAgentDigital/ThinUI/
├── src/                # UI components (Svelte/React)
├── src-tauri/           # Tauri backend
│   ├── src/            # Rust backend code
│   └── tauri.conf.json # Tauri configuration
├── public/             # Static assets
├── index.html          # Main HTML entry
├── package.json        # Frontend dependencies
├── Cargo.toml          # Rust dependencies
├── tauri.conf.json     # Tauri configuration
└── README.md            # Project documentation
```

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
# Clone to okAgentDigital directory
mkdir -p ~/Code/okAgentDigital
cd ~/Code/okAgentDigital

git clone git@github.com:OkAgentDigital/ThinUI.git
cd ThinUI
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (if needed)
cargo build
```

### 3. Configure for uDos Integration

```bash
# Update tauri.conf.json to connect to uDos MCP sockets
cat > src-tauri/tauri.conf.json << 'EOF'
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all"
    },
    "windows": [
      {
        "title": "ThinUI",
        "width": 1200,
        "height": 800,
        "resizable": true
      }
    ],
    "security": {
      "csp": "default-src self; script-src self"
    }
  },
  "plugins": {
    "mcp": {
      "core_socket": "~/Code/Vault/.uds/mcp.sock",
      "re3engine_socket": "~/.uds/re3engine.sock",
      "orchestrator_socket": "~/Code/Vault/.uds/orchestrator.sock"
    }
  }
}
EOF
```

### 4. Link to uDosGo

```bash
# Navigate to uDosGo
cd ~/Code/uDosGo

# Remove old ThinUI if it exists
rm -rf ThinUI

# Create symlink to external ThinUI
ln -s ~/Code/okAgentDigital/ThinUI ThinUI

# Verify symlink
ls -la ThinUI
```

### 5. Update uDosGo Configuration

```bash
# Update udos-config.yaml
cat >> udos-config.yaml << 'EOF'

# ThinUI Configuration
thinui:
  external: true
  path: "../okAgentDigital/ThinUI"
  dev_port: 1420
  prod_port: 8080
  mcp_sockets:
    core: "~/Code/Vault/.uds/mcp.sock"
    re3engine: "~/.uds/re3engine.sock"
    orchestrator: "~/Code/Vault/.uds/orchestrator.sock"
EOF
```

### 6. Update Startup Scripts

```bash
# Update start-dev.sh
sed -i '' 's|cd ~/Code/uDosGo/ThinUI|cd ~/Code/okAgentDigital/ThinUI|' start-dev.sh

# Update stop-dev.sh
sed -i '' 's|ThinUI|okAgentDigital/ThinUI|' stop-dev.sh
```

### 7. Update .gitignore

```bash
# Add ThinUI symlink to .gitignore
echo "ThinUI" >> .gitignore
```

## 🔄 Development Workflow

### Starting ThinUI

```bash
# Navigate to ThinUI
cd ~/Code/okAgentDigital/ThinUI

# Start in development mode
npm run tauri dev

# Or start in production mode
npm run build
npm run tauri build
```

### Starting Full Stack

```bash
# From uDosGo directory
cd ~/Code/uDosGo
./start-dev.sh
```

## 📊 Integration Points

### MCP Communication

ThinUI communicates with uDos components via MCP sockets:

```json
{
  "mcp_sockets": {
    "core": "~/Code/Vault/.uds/mcp.sock",
    "re3engine": "~/.uds/re3engine.sock",
    "orchestrator": "~/Code/Vault/.uds/orchestrator.sock"
  }
}
```

### Skill Integration

ThinUI can execute skills via MCP:

```javascript
// Example: Execute note-taker skill
async function createNote(title, tags) {
  const response = await invoke('execute_skill', {
    skill: 'note-taker',
    args: { title, tags }
  });
  return response;
}
```

## 🛠️ Building & Distribution

### Development Build

```bash
npm run tauri dev
```

### Production Build

```bash
npm run build
npm run tauri build
```

### Cross-platform Builds

```bash
# macOS
npm run tauri build -- --target universal-apple-darwin

# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## 📦 Distribution

Built applications will be in:
```
src-tauri/target/release/bundle/
```

### macOS
```
src-tauri/target/release/bundle/dmg/ThinUI_0.1.0_x64.dmg
src-tauri/target/release/bundle/macos/ThinUI.app
```

### Windows
```
src-tauri/target/release/bundle/msi/ThinUI_0.1.0_x64_en-US.msi
src-tauri/target/release/bundle/nsis/ThinUI_0.1.0_x64_setup.exe
```

### Linux
```
src-tauri/target/release/bundle/appimage/ThinUI_0.1.0_x86_64.AppImage
src-tauri/target/release/bundle/deb/thinui_0.1.0_amd64.deb
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file
TAURI_CORE_SOCKET=~/Code/Vault/.uds/mcp.sock
TAURI_RE3ENGINE_SOCKET=~/.uds/re3engine.sock
TAURI_ORCHESTRATOR_SOCKET=~/Code/Vault/.uds/orchestrator.sock
```

### Build Configuration

```json
{
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:1420"
  }
}
```

## 📚 Best Practices

### 1. Keep ThinUI Lightweight
- **Do**: UI components only
- **Don't**: Business logic in ThinUI
- **Do**: Communicate via MCP
- **Don't**: Direct database access

### 2. Error Handling
```javascript
try {
  const result = await invoke('mcp_call', { method: 'health' });
  return result;
} catch (error) {
  console.error('MCP Error:', error);
  showErrorToUser('Connection failed');
}
```

### 3. State Management
```javascript
// Use stores for shared state
import { writable } from 'svelte/store';

export const mcpStatus = writable('disconnected');
export const currentTheme = writable('light');
```

### 4. Logging
```javascript
// Centralized logging
function log(action, data) {
  console.log(`[ThinUI] ${action}`, data);
  invoke('log_event', { action, data }).catch(() => {});
}
```

## 🎯 Benefits of Separation

### 1. Independent Development
- ThinUI can be updated separately
- No coordination needed with core team
- Faster iteration cycle

### 2. Clear Boundaries
- UI concerns only in ThinUI
- Business logic in uCode1
- Clean API via MCP

### 3. Distribution Flexibility
- Can distribute ThinUI as standalone app
- Users can update UI independently
- Multiple UI versions possible

### 4. Technology Choice
- ThinUI can use any frontend framework
- Not tied to Rust ecosystem
- Easier to find frontend developers

## 🚀 Future Enhancements

### Planned Features
- [ ] Theme switching via MCP
- [ ] Plugin system for UI extensions
- [ ] Web-based ThinUI variant
- [ ] Mobile ThinUI (experimental)

### Architecture Improvements
- [ ] WebSocket fallback for MCP
- [ ] Offline mode support
- [ ] Progressive enhancement
- [ ] Accessibility improvements

## 📞 Support

### Common Issues

**MCP Connection Failed**:
```bash
# Check if sockets exist
ls -la ~/Code/Vault/.uds/

# Restart uCode1 core
cd ~/Code/uDosGo/uCode1
./target/release/uCode1 --status
```

**Build Errors**:
```bash
# Clean and rebuild
rm -rf node_modules/ target/
npm install
npm run tauri clean
npm run tauri build
```

### Debugging

```bash
# Development mode with debug logs
TAURI_DEBUG=1 npm run tauri dev

# Check Tauri logs
tail -f ~/.cache/tauri.log
```

## 🎉 Conclusion

ThinUI is now a **standalone, lightweight UI component** that:
- ✅ Communicates via MCP sockets
- ✅ Can be developed independently
- ✅ Maintains clear separation from business logic
- ✅ Can be distributed as a compiled application

**Result**: A more maintainable, flexible, and performant UI architecture! 🎉

### Next Steps
1. Test the ThinUI integration
2. Build production versions
3. Set up CI/CD for ThinUI
4. Document any customizations

**Happy developing!** The ThinUI component is now ready for independent development and distribution. 🚀

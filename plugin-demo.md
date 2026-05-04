# ThinUI Plugin & Theme System Demo

## Current Architecture

ThinUI currently loads UDX (uDos eXchange) files from `~/Code/Vault/.udx/` and renders them using a simple teletext-style renderer. The system is designed to be extensible.

## Plugin System Design

### 1. Current Plugin Capabilities

ThinUI already supports these plugin-like features:

- **UDX Blocks**: Different block types (`teletext-page`, `list`, etc.)
- **Tauri Commands**: Rust backend commands (`connect_core`, `disconnect`, `load_udx_from_vault`)
- **Event System**: Listens for `core-event` events

### 2. Adding New Plugin Types

To add a new display plugin, you would:

#### Frontend (JavaScript)
```javascript
// Add to renderDashboard function in ui/main.js
function renderDashboard(udx) {
    // ... existing code ...
    
    if (udx.blocks) {
        for (const block of udx.blocks) {
            if (block.type === 'teletext-page') {
                html += `<div class="teletext-page"><pre>${block.extra.content || ''}</pre></div>`;
            } else if (block.type === 'list') {
                html += `<div class="teletext-list"><pre>${block.extra.items || ''}</pre></div>`;
            } else if (block.type === 'gauge') {  // NEW: Gauge plugin
                html += renderGauge(block.extra);
            } else if (block.type === 'chart') {  // NEW: Chart plugin
                html += renderChart(block.extra);
            } else {
                html += `<div class="teletext-block">${JSON.stringify(block)}</div>`;
            }
        }
    }
}

function renderGauge(extra) {
    return `
        <div class="gauge-plugin">
            <div class="gauge-label">${extra.label || 'Metric'}</div>
            <div class="gauge-container">
                <div class="gauge-fill" style="width: ${extra.value || 0}%"></div>
            </div>
            <div class="gauge-value">${extra.value || 0}%</div>
        </div>
    `;
}

function renderChart(extra) {
    // Would use a charting library like Chart.js
    return `<div class="chart-plugin" data-chart="${encodeURIComponent(JSON.stringify(extra))}"></div>`;
}
```

#### Backend (Rust) - Add new command in src-tauri/src/lib.rs
```rust
#[tauri::command]
async fn load_plugin_data(plugin_name: String, params: serde_json::Value) -> Result<serde_json::Value, String> {
    // Load plugin-specific data
    let plugin_path = PathBuf::from(format!("~/Code/Vault/.udx/plugins/{}", plugin_name));
    
    // Implementation would load and process plugin data
    Ok(serde_json::json!({
        "status": "loaded",
        "plugin": plugin_name,
        "data": params
    }))
}
```

### 3. Theme System

#### CSS Themes
Create theme files in `ui/themes/`:

**ui/themes/teletext.css**
```css
:root {
    --bg-color: #000000;
    --text-color: #ffffff;
    --accent-color: #ff00ff;
    --font-family: 'Courier New', monospace;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
    font-family: var(--font-family);
}

.teletext-page {
    font-family: var(--font-family);
    line-height: 1.2;
    color: var(--text-color);
}
```

**ui/themes/modern.css**
```css
:root {
    --bg-color: #f5f5f5;
    --text-color: #333333;
    --accent-color: #4a90e2;
    --font-family: 'Segoe UI', sans-serif;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
    font-family: var(--font-family);
}

.teletext-page {
    font-family: var(--font-family);
    line-height: 1.5;
    padding: 20px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

#### Theme Loader (JavaScript)
```javascript
// Add to ui/main.js
async function loadTheme(themeName) {
    try {
        const response = await fetch(`themes/${themeName}.css`);
        if (response.ok) {
            const css = await response.text();
            const style = document.createElement('style');
            style.id = 'current-theme';
            style.textContent = css;
            
            // Remove old theme
            const oldTheme = document.getElementById('current-theme');
            if (oldTheme) oldTheme.remove();
            
            // Add new theme
            document.head.appendChild(style);
            
            // Save preference
            localStorage.setItem('theme', themeName);
            
            return true;
        }
    } catch (err) {
        console.error('Failed to load theme:', err);
    }
    return false;
}

// Load saved theme on startup
const savedTheme = localStorage.getItem('theme') || 'teletext';
loadTheme(savedTheme);
```

## Example: Creating a Status Gauge Plugin

### 1. Create UDX with Gauge Block
```json
{
  "version": "1.0",
  "type": "dashboard",
  "title": "System Monitoring",
  "blocks": [
    {
      "type": "gauge",
      "extra": {
        "label": "CPU Usage",
        "value": 75,
        "min": 0,
        "max": 100,
        "units": "%"
      }
    },
    {
      "type": "gauge",
      "extra": {
        "label": "Memory Usage",
        "value": 45,
        "min": 0,
        "max": 100,
        "units": "%"
      }
    }
  ]
}
```

### 2. Add CSS for Gauge Plugin
```css
.gauge-plugin {
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 5px;
    margin: 10px 0;
    width: 100%;
}

.gauge-label {
    text-align: center;
    margin-bottom: 8px;
    font-size: 0.9em;
}

.gauge-container {
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
}

.gauge-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff00ff, #00ffff);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.gauge-value {
    text-align: center;
    margin-top: 5px;
    font-family: monospace;
}
```

## Packaging as a Component

### Current Component Structure

ThinUI is already modular:

1. **Frontend Component**: `ui/` directory with HTML/JS/CSS
2. **Backend Component**: `src-tauri/` with Rust commands
3. **Data Layer**: UDX files in vault

### Using as a Standalone Component

To use ThinUI as a component in other applications:

#### Option 1: Web Component
```javascript
// Create a ThinUI web component
class ThinUIElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="thinui-container">
                <div id="thinui-app"></div>
            </div>
        `;
        
        // Load ThinUI CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'thinui/styles.css';
        document.head.appendChild(link);
        
        // Load ThinUI JS
        const script = document.createElement('script');
        script.src = 'thinui/main.js';
        script.type = 'module';
        document.head.appendChild(script);
    }
}

customElements.define('thin-ui', ThinUIElement);
```

#### Option 2: iframe Embedding
```html
<iframe src="http://localhost:7846" 
        width="100%" 
        height="600" 
        frameborder="0"
        allowfullscreen></iframe>
```

#### Option 3: Tauri Embedding
```rust
// In another Tauri app, embed ThinUI as a child window
use tauri::WindowBuilder;

fn create_thinui_window() {
    WindowBuilder::new(
        &app.handle(),
        "thinui", 
        tauri::WindowUrl::External("http://localhost:7846".parse().unwrap())
    )
    .title("ThinUI Dashboard")
    .inner_size(800.0, 600.0)
    .resizable(true)
    .build()
    .unwrap();
}
```

## Implementation Roadmap

### Phase 1: Basic Plugin Support (Current)
- [x] UDX block rendering system
- [x] Tauri command interface
- [x] Event listening system

### Phase 2: Advanced Plugins (Next Steps)
- [ ] Dynamic plugin loading from vault
- [ ] Plugin registry system
- [ ] Plugin dependencies management
- [ ] Sandboxed plugin execution

### Phase 3: Theme System
- [ ] Theme switching UI
- [ ] Theme marketplace
- [ ] User theme creation tools
- [ ] Theme inheritance

### Phase 4: Component Packaging
- [ ] Web component bundle
- [ ] NPM package
- [ ] Tauri plugin crate
- [ ] Documentation and examples

## Example: Complete Plugin Implementation

Let me create a working example of a gauge plugin...
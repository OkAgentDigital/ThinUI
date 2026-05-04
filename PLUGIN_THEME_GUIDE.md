# ThinUI Plugin & Theme System - Complete Guide

## 🎯 Overview

ThinUI now supports a flexible plugin and theme system that allows you to:
- Create custom display plugins (gauge, charts, etc.)
- Switch between different visual themes
- Extend functionality without modifying core code
- Use ThinUI as a component in larger applications

## 🔌 Plugin System

### Current Built-in Plugins

1. **teletext-page**: Renders pre-formatted teletext-style content
2. **list**: Displays lists of items
3. **gauge**: Visual gauge/meter (NEW!)

### Creating Custom Plugins

#### Step 1: Define Plugin Renderer

Add a new case to the `renderDashboard()` function in `ui/main.js`:

```javascript
function renderDashboard(udx) {
    // ... existing code ...
    
    if (udx.blocks) {
        for (const block of udx.blocks) {
            if (block.type === 'teletext-page') {
                html += `<div class="teletext-page"><pre>${block.extra.content || ''}</pre></div>`;
            } else if (block.type === 'list') {
                html += `<div class="teletext-list"><pre>${block.extra.items || ''}</pre></div>`;
            } else if (block.type === 'gauge') {
                html += renderGauge(block.extra);  // Custom plugin
            } else if (block.type === 'chart') {
                html += renderChart(block.extra);  // Your new plugin
            } else {
                html += `<div class="teletext-block">${JSON.stringify(block)}</div>`;
            }
        }
    }
}
```

#### Step 2: Implement Render Function

```javascript
function renderChart(extra) {
    // Extract chart data
    const title = extra.title || 'Chart';
    const labels = extra.labels || [];
    const data = extra.data || [];
    
    // Generate HTML for chart
    return `
        <div class="chart-plugin">
            <h3>${title}</h3>
            <canvas class="chart-canvas" 
                   data-labels='${JSON.stringify(labels)}' 
                   data-values='${JSON.stringify(data)}'></canvas>
        </div>
    `;
}
```

#### Step 3: Add CSS Styles

```css
.chart-plugin {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin: 15px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-canvas {
    width: 100%;
    height: 300px;
}
```

#### Step 4: Create UDX with Your Plugin

```json
{
  "version": "1.0",
  "type": "dashboard",
  "title": "System Monitoring",
  "blocks": [
    {
      "type": "chart",
      "extra": {
        "title": "CPU Usage Over Time",
        "labels": ["00:00", "01:00", "02:00", "03:00"],
        "data": [25, 35, 45, 30]
      }
    }
  ]
}
```

## 🎨 Theme System

### Built-in Themes

1. **Default (teletext)**: Classic teletext style with monospace fonts
2. **Modern**: Clean, modern UI with rounded corners and shadows

### Creating Custom Themes

#### Step 1: Create Theme CSS File

Create a new file in `ui/themes/` (e.g., `ui/themes/dark.css`):

```css
:root {
    --bg-color: #121212;
    --text-color: #e0e0e0;
    --accent-color: #bb86fc;
    --font-family: 'Roboto', sans-serif;
    --gauge-bg: rgba(255, 255, 255, 0.05);
    --gauge-fill: linear-gradient(90deg, #bb86fc, #03dac6);
}

body {
    background: var(--bg-color);
    color: var(--text-color);
}

/* Override specific components */
.teletext-page {
    background: #1e1e1e;
    border: 1px solid #333;
}

.gauge-plugin {
    background: var(--gauge-bg);
    border: 1px solid #333;
}
```

#### Step 2: Load Theme Dynamically

The theme system automatically loads themes using JavaScript:

```javascript
// Load a theme
await loadTheme('dark');

// Theme is saved to localStorage and persists across sessions
```

### Theme Switching

Add theme switching buttons to your UI:

```javascript
// Add to your UI setup
const themeButtons = document.createElement('div');
themeButtons.className = 'theme-switcher';
themeButtons.innerHTML = `
    <button onclick="loadTheme('teletext')">Teletext</button>
    <button onclick="loadTheme('modern')">Modern</button>
    <button onclick="loadTheme('dark')">Dark</button>
`;
document.body.appendChild(themeButtons);
```

## 📦 Using ThinUI as a Component

### Option 1: Web Component

```javascript
// Register ThinUI as a web component
class ThinUIElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="thinui-container">
                <iframe src="http://localhost:7846" 
                       width="100%" 
                       height="100%" 
                       frameborder="0"></iframe>
            </div>
        `;
    }
}

customElements.define('thin-ui', ThinUIElement);

// Use in HTML
<thin-ui style="width: 800px; height: 600px;"></thin-ui>
```

### Option 2: Direct iframe Embedding

```html
<iframe src="http://localhost:7846" 
        width="100%" 
        height="600" 
        frameborder="0"
        allowfullscreen></iframe>
```

### Option 3: Tauri Window Embedding

```rust
// In another Tauri application
use tauri::WindowBuilder;

fn create_thinui_window(app: &tauri::App) {
    WindowBuilder::new(
        app.handle(),
        "thinui_dashboard", 
        tauri::WindowUrl::External("http://localhost:7846".parse().unwrap())
    )
    .title("ThinUI Dashboard")
    .inner_size(800.0, 600.0)
    .resizable(true)
    .build()
    .unwrap();
}
```

### Option 4: Standalone Application

ThinUI can run as a standalone Tauri application:

```bash
# Build standalone app
cd ~/Code/uDosGo/ThinUI
cargo tauri build

# Run the installed app
open src-tauri/target/release/bundle/macos/ThinUI.app
```

## 🚀 Demo: Gauge Plugin

A working gauge plugin has been implemented. To see it in action:

1. **Create gauge demo UDX**:
   ```bash
   cp ~/Code/uDosGo/ThinUI/ui/themes/gauge-demo.udx ~/Code/Vault/.udx/gauge-demo.udx
   ```

2. **Run ThinUI**:
   ```bash
   cd ~/Code/uDosGo/ThinUI
   ./launch.sh
   ```

3. **What you'll see**:
   - Modern theme with clean UI
   - Three gauge plugins showing system metrics
   - Teletext page with plugin information
   - List of plugin architecture details

## 📁 File Structure

```
ThinUI/
├── ui/
│   ├── index.html          # Main HTML
│   ├── main.js             # Main JavaScript (plugin rendering)
│   ├── styles.css          # Default styles
│   └── themes/             # Theme directory
│       ├── modern.css      # Modern theme
│       └── gauge-demo.udx  # Demo UDX file
├── src-tauri/              # Rust backend
│   ├── src/lib.rs          # Tauri commands
│   └── tauri.conf.json     # Tauri configuration
├── vite.config.js          # Vite configuration
├── launch.sh               # Launch script
└── plugin-demo.md          # Plugin documentation
```

## 🔧 Backend Extensions

### Adding New Tauri Commands

To support plugins with backend data:

```rust
// In src-tauri/src/lib.rs

#[tauri::command]
async fn get_plugin_data(plugin_name: String) -> Result<serde_json::Value, String> {
    // Load plugin-specific data from vault
    let plugin_path = tilde(&format!("~/Code/Vault/.udx/plugins/{}", plugin_name));
    let full_path = PathBuf::from(plugin_path.into_owned());
    
    if !full_path.exists() {
        return Err(format!("Plugin {} not found", plugin_name));
    }
    
    let content = std::fs::read_to_string(full_path)
        .map_err(|e| format!("Failed to read plugin: {}", e))?;
    
    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse plugin data: {}", e))
}
```

### Plugin Registry

Create a plugin registry in `~/Code/Vault/.udx/plugins/`:

```
Vault/.udx/
├── dashboard.udx          # Main dashboard
├── gauge-demo.udx        # Demo with gauges
└── plugins/              # Plugin directory
    ├── cpu-monitor/       # CPU monitoring plugin
    │   ├── config.json    # Plugin configuration
    │   └── data.json      # Plugin data
    ├── memory-monitor/    # Memory plugin
    │   ├── config.json
    │   └── data.json
    └── network-monitor/   # Network plugin
        ├── config.json
        └── data.json
```

## 🎯 Future Enhancements

### Plugin Marketplace
- Online repository of ThinUI plugins
- One-click installation
- Plugin updates
- Community contributions

### Advanced Theming
- Theme inheritance
- User theme editor
- Theme preview
- Theme export/import

### Component Packaging
- NPM package for web usage
- Tauri plugin crate
- WASM compilation
- Mobile support

### Performance Optimization
- Plugin lazy loading
- Virtualized lists for large datasets
- Web Workers for heavy computations
- Caching strategies

## 📚 Examples

### Example 1: Simple Status Plugin

```json
{
  "type": "status",
  "extra": {
    "label": "System Status",
    "status": "operational",
    "message": "All systems normal",
    "timestamp": "2024-04-25T12:00:00Z"
  }
}
```

### Example 2: Progress Plugin

```json
{
  "type": "progress",
  "extra": {
    "label": "Data Processing",
    "value": 75,
    "max": 100,
    "units": "%",
    "status": "Processing..."
  }
}
```

### Example 3: Alert Plugin

```json
{
  "type": "alert",
  "extra": {
    "severity": "warning",
    "title": "High CPU Usage",
    "message": "CPU has been above 90% for 5 minutes",
    "timestamp": "2024-04-25T12:05:00Z",
    "actions": [
      {"label": "Dismiss", "action": "dismiss"},
      {"label": "View Details", "action": "details"}
    ]
  }
}
```

## 🎓 Best Practices

### Plugin Development
1. **Keep plugins focused**: Each plugin should do one thing well
2. **Use semantic versioning**: For plugin compatibility
3. **Document inputs/outputs**: Clearly specify what data your plugin expects
4. **Handle errors gracefully**: Provide fallback content when data is missing
5. **Optimize performance**: Avoid blocking the main thread

### Theme Development
1. **Use CSS variables**: For easy customization
2. **Support dark/light modes**: Use media queries
3. **Ensure accessibility**: Proper contrast and font sizes
4. **Test across browsers**: Ensure consistent rendering
5. **Keep it simple**: Avoid overly complex animations

### Component Usage
1. **Isolate scope**: Use shadow DOM for web components
2. **Define clear APIs**: Document how to interact with the component
3. **Handle resizing**: Make sure the component responds to size changes
4. **Provide callbacks**: Allow parent applications to listen to events
5. **Optimize bundle size**: Tree-shake unused code

## 🔗 Integration with Other Systems

### uDos Core Integration
ThinUI can connect to uDos core services:

```javascript
// Connect to uDos core
async function connectToCore() {
    await invoke('connect_core');
    
    // Listen for core events
    listen('core-event', (event) => {
        const payload = event.payload;
        
        // Update plugins based on core events
        if (payload.type === 'health') {
            updateHealthPlugin(payload.data);
        }
    });
}
```

### External API Integration

```javascript
// Fetch data from external API for a plugin
async function fetchExternalData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        
        // Update plugin display
        renderExternalDataPlugin(data);
    } catch (error) {
        console.error('Failed to fetch external data:', error);
        // Show error state in plugin
        showPluginError('external-data', 'Failed to load data');
    }
}
```

## 🚀 Getting Started with Development

### 1. Create a New Plugin

```bash
# Create plugin directory
mkdir -p ~/Code/Vault/.udx/plugins/my-plugin

# Create plugin data file
cat > ~/Code/Vault/.udx/plugins/my-plugin/data.json << EOF
{
  "name": "my-plugin",
  "version": "1.0.0",
  "type": "custom",
  "data": {
    "message": "Hello from my plugin!"
  }
}
EOF
```

### 2. Add Plugin Renderer

Edit `ui/main.js` and add your plugin type:

```javascript
// Add to renderDashboard function
} else if (block.type === 'custom') {
    html += renderCustomPlugin(block.extra);
}

// Implement render function
function renderCustomPlugin(extra) {
    return `<div class="custom-plugin">${extra.message || 'No data'}</div>`;
}
```

### 3. Add Plugin Styles

Edit your theme CSS file:

```css
.custom-plugin {
    background: var(--gauge-bg);
    padding: 15px;
    border-radius: 8px;
    margin: 10px 0;
}
```

### 4. Create UDX with Your Plugin

```json
{
  "version": "1.0",
  "type": "dashboard",
  "title": "My Dashboard",
  "blocks": [
    {
      "type": "custom",
      "extra": {
        "message": "This is my custom plugin!"
      }
    }
  ]
}
```

### 5. Test Your Plugin

```bash
cd ~/Code/uDosGo/ThinUI
./launch.sh
```

## 📊 Performance Considerations

### Plugin Rendering
- Use `requestAnimationFrame` for animations
- Debounce rapid updates
- Virtualize long lists
- Use CSS transforms for smooth animations

### Memory Management
- Clean up event listeners
- Remove DOM elements when no longer needed
- Use weak references for caches
- Monitor memory usage in long-running sessions

### Network Efficiency
- Cache API responses
- Use compression
- Batch multiple requests
- Implement retry logic with backoff

## 🎯 Summary

ThinUI's plugin and theme system provides:

✅ **Extensible Architecture**: Easy to add new display types
✅ **Theme Support**: Switch between different visual styles
✅ **Component Ready**: Can be embedded in larger applications
✅ **Performance Optimized**: Efficient rendering and updates
✅ **Well Documented**: Clear examples and guides

The system is designed to grow with your needs, from simple dashboards to complex monitoring systems with custom visualizations.

**Next Steps**:
1. Experiment with the gauge plugin demo
2. Create your own custom plugins
3. Design new themes
4. Integrate ThinUI into your applications
5. Explore advanced features like Blitz integration

Happy coding! 🚀
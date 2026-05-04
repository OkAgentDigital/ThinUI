# Retro System Baseline Specification

## 🎯 Core Philosophy

All retro systems share a **common grid-based layout** with **unique components**. By identifying the common patterns and variations, we can create a **unified rendering engine** with **system-specific modules**.

## 📐 Common Grid Layout

### Base Grid System
```
All systems use:
- Fixed character/pixel grid
- Character-based addressing
- Limited color palettes
- CRT display output
```

### Grid Comparison

| System      | Resolution  | Grid Size   | Character Size | Colors | Unique Feature          |
|-------------|-------------|-------------|----------------|--------|------------------------|
| C64         | 320×200     | 40×25       | 8×8 pixels     | 16     | Border with color cycling |
| NES         | 256×240     | 32×30       | 8×8 pixels     | 54     | Attribute tables        |
| Teletext    | 40×24 chars | 40×24       | 1 char         | 8      | Block graphics         |
| **Baseline**| **Variable**| **40×25**    | **8×8**         | **16**  | **Modular components**  |
```

## 🧩 Component Architecture

### 1. Core Components (All Systems)

#### Character Grid
```rust
struct CharacterGrid {
    width: u8,      // Columns (40 for baseline)
    height: u8,     // Rows (25 for baseline)
    cell_width: u8,  // 8 pixels
    cell_height: u8, // 8 pixels
}
```

#### Color Palette
```rust
struct ColorPalette {
    colors: [RGBA; 16],  // Base 16 colors (expandable)
    background: usize,  // Default background index
    foreground: usize,  // Default foreground index
}
```

#### Screen Memory
```rust
struct ScreenMemory {
    // Character indices (0-255)
    characters: Vec<Vec<u8>>,  // [row][column]
    
    // Color attributes
    colors: Vec<Vec<u8>>,      // [row][column]
    
    // Dirty flags for optimization
    dirty: Vec<Vec<bool>>,
}
```

#### Character ROM
```rust
struct CharacterROM {
    // 256 characters × 8×8 pixels
    glyphs: [[[bool; 8]; 8]; 256],
    
    // System-specific fonts
    current_font: FontType,
}

enum FontType {
    C64(PETSCII),      // C64 PETSCII characters
    NES(Standard),     // NES tile set
    Teletext(UK),      // Teletext glyphs
    Custom(Vec<u8>),   // User-defined
}
```

### 2. System-Specific Components

#### C64 Components

```rust
struct C64Components {
    // Border system
    border: Border,
    
    // Color cycling
    color_cycler: ColorCycler,
    
    // PETSCII font
    petscii: PETSCIIFont,
}

struct Border {
    color: u8,          // Border color index
    width: u8,          // Border width in pixels
    visible: bool,      // Show/hide border
    cycle_speed: f32,  // Color cycling speed
}

struct ColorCycler {
    palette: [u8; 16],  // Colors to cycle through
    current: usize,     // Current index
    speed: f32,         // Cycles per second
    active: bool,       // Enable/disable
}
```

#### NES Components

```rust
struct NESComponents {
    // Attribute tables (2x2 tile groups)
    attribute_tables: [AttributeTable; 4],
    
    // Sprite system
    sprites: SpriteSystem,
    
    // NES-specific font
    nes_font: NESFont,
}

struct AttributeTable {
    // 16x16 entries (32x30 tiles / 2)
    data: [[u8; 16]; 16],
}

struct SpriteSystem {
    sprites: [Sprite; 64],  // 64 hardware sprites
    max_per_line: u8,       // 8 sprites per scanline
}

struct Sprite {
    x: u8,
    y: u8,
    tile: u8,
    palette: u8,
    flip_h: bool,
    flip_v: bool,
    priority: bool,
}
```

#### Teletext Components

```rust
struct TeletextComponents {
    // Block graphics system
    block_graphics: BlockGraphics,
    
    // Page system
    page_manager: PageManager,
    
    // Teletext font
    teletext_font: TeletextFont,
}

struct BlockGraphics {
    // 6 mosaic patterns per character
    patterns: [[[bool; 3]; 2]; 6],  // 2x3 pixel blocks
    
    // Block graphics mode
    enabled: bool,
}

struct PageManager {
    current_page: u16,      // 100-899
    pages: HashMap<u16, PageContent>,
    loading: bool,
    transmission_speed: f32,  // Simulated
}
```

### 3. Common Rendering Pipeline

```rust
trait RetroRenderer {
    fn initialize(&mut self, config: RenderConfig);
    fn set_character(&mut self, x: u8, y: u8, char: u8, color: u8);
    fn set_palette(&mut self, palette: ColorPalette);
    fn render(&self) -> FrameBuffer;
    fn apply_crt_effects(&mut self, frame: &mut FrameBuffer);
    fn get_grid_size(&self) -> (u8, u8);
}

struct RenderConfig {
    system: RetroSystem,
    resolution: (u16, u16),
    scale: f32,
    crt_effects: bool,
    scanlines: bool,
}

enum RetroSystem {
    C64,
    NES,
    Teletext,
    Custom,
}
```

## 🎨 Font Specifications

### PETSCII (C64)

```
PETSCII Characteristics:
- 256 glyphs (0x00-0xFF)
- Uppercase-only base set
- Graphics characters (0x80-0xFF)
- Reversed characters (0x40-0x5F)
- Block graphics (0x70-0x7F)

PETSCII Layout:
0x00-0x1F: Control codes
0x20-0x3F: ASCII punctuation/numbers
0x40-0x5F: Uppercase letters
0x60-0x7F: Graphics/symbols
0x80-0xFF: Reversed/alternate characters
```

### NES Font

```
NES Font Characteristics:
- 8x8 pixel tiles
- Limited to available CHR-ROM
- Typically uppercase-only
- Blocky, pixelated style
- Often includes Japanese characters

NES Standard Layout:
0x00-0x0F: Blank/control tiles
0x10-0x1F: Numbers/symbols
0x20-0x3F: Uppercase letters
0x40-0xFF: Graphics/sprites
```

### Teletext Font

```
Teletext Font Characteristics:
- Fixed 2x3 pixel grid per character
- Special descenders (g, j, p, q, y)
- Block graphics (mosaics)
- Limited to broadcast standard
- No anti-aliasing

Teletext Glyph Structure:
- 10 rows × 12 columns per character
- 2×3 pixel blocks for graphics
- Fixed character positions
- No proportional spacing
```

## 🎮 Input System Specification

### Common Input Interface

```rust
trait RetroInput {
    fn handle_key(&mut self, key: VirtualKey, state: KeyState);
    fn handle_joy(&mut self, button: JoyButton, state: ButtonState);
    fn get_input_state(&self) -> InputState;
    fn reset(&mut self);
}

enum VirtualKey {
    Up, Down, Left, Right,
    Fire, Jump, Start, Select,
    Key0, Key1, Key2, Key3, Key4,
    Key5, Key6, Key7, Key8, Key9,
}

enum JoyButton {
    A, B, X, Y,
    Start, Select,
    Up, Down, Left, Right,
}
```

### System-Specific Mappings

#### C64 Input Mapping

```rust
struct C64Input {
    // Joystick in port 2
    joystick: JoystickState,
    
    // Keyboard matrix
    keyboard: [[bool; 8]; 8],  // 8×8 matrix
    
    // Special keys
    run_stop: bool,
    restore: bool,
    commodore: bool,
}
```

#### NES Input Mapping

```rust
struct NESInput {
    // Controller 1
    controller1: NESController,
    
    // Controller 2
    controller2: NESController,
    
    // Zapper (light gun)
    zapper: Option<ZapperState>,
}

struct NESController {
    a: bool,
    b: bool,
    start: bool,
    select: bool,
    up: bool,
    down: bool,
    left: bool,
    right: bool,
    strobe: bool,
}
```

## 🖥️ CRT Effects Specification

### Common CRT Parameters

```rust
struct CRTEffects {
    // Scanline parameters
    scanlines: ScanlineConfig,
    
    // Phosphor parameters
    phosphor: PhosphorConfig,
    
    // Curvature parameters
    curvature: CurvatureConfig,
    
    // Color bleeding
    bleeding: ColorBleedingConfig,
    
    // Flicker simulation
    flicker: FlickerConfig,
}
```

### Effect Configurations

```rust
struct ScanlineConfig {
    intensity: f32,      // 0.0 - 1.0
    width: f32,           // 1.0 - 3.0 pixels
    color: RGBA,          // Scanline color
    pattern: ScanPattern, // Even, Odd, Both
}

enum ScanPattern {
    Even,   // Only even scanlines
    Odd,     // Only odd scanlines
    Both,    // All scanlines
    Custom,  // Custom pattern
}

struct PhosphorConfig {
    decay: f32,          // 0.0 - 1.0 (persistence)
    bloom: f32,          // 0.0 - 1.0 (glow spread)
    colors: [RGBA; 3],   // RGB phosphor colors
}

struct CurvatureConfig {
    horizontal: f32,     // -1.0 to 1.0
    vertical: f32,       // -1.0 to 1.0
    barrel: f32,          // -1.0 to 1.0
    pincushion: f32,     // -1.0 to 1.0
}

struct ColorBleedingConfig {
    amount: f32,         // 0.0 - 1.0
    radius: u8,          // 1 - 5 pixels
    strength: f32,       // 0.0 - 1.0
}

struct FlickerConfig {
    amount: f32,         // 0.0 - 1.0
    speed: f32,          // 0.1 - 10.0 Hz
    pattern: FlickerPattern,
}

enum FlickerPattern {
    Random,
    LineBased,      // Even/odd line intensity
    FrameBased,      // Alternating frames
    Interlace,       // Simulated interlace
}
```

## 🎨 Color Palette Specifications

### C64 Color Palette (NTSC)

```rust
const C64_NTSC_PALETTE: [RGBA; 16] = [
    RGBA(0x00, 0x00, 0x00, 0xFF),    // Black
    RGBA(0xFF, 0xFF, 0xFF, 0xFF),    // White
    RGBA(0x88, 0x39, 0x32, 0xFF),    // Red
    RGBA(0x67, 0xB6, 0xBD, 0xFF),    // Cyan
    RGBA(0x8B, 0x3F, 0x96, 0xFF),    // Purple
    RGBA(0x55, 0xA0, 0x49, 0xFF),    // Green
    RGBA(0x40, 0x31, 0x8D, 0xFF),    // Blue
    RGBA(0xC8, 0xC5, 0x69, 0xFF),    // Yellow
    RGBA(0x8B, 0x54, 0x2C, 0xFF),    // Orange
    RGBA(0x55, 0x40, 0x00, 0xFF),    // Brown
    RGBA(0xB8, 0x69, 0x62, 0xFF),    // Pink
    RGBA(0x6E, 0x6E, 0x6E, 0xFF),    // Dark Gray
    RGBA(0x96, 0x96, 0x96, 0xFF),    // Medium Gray
    RGBA(0x75, 0xCE, 0x66, 0xFF),    // Light Green
    RGBA(0x6F, 0x5E, 0xH1, 0xFF),    // Light Blue
    RGBA(0xA9, 0xA9, 0xA9, 0xFF),    // Light Gray
];
```

### NES Color Palette

```rust
const NES_PALETTE: [RGBA; 64] = [
    // Background colors (16)
    RGBA(0x66, 0x66, 0x66, 0xFF), RGBA(0x00, 0x26, 0x88, 0xFF), RGBA(0x14, 0x12, 0xA7, 0xFF), RGBA(0x3B, 0x00, 0xA4, 0xFF),
    RGBA(0x5C, 0x00, 0x7E, 0xFF), RGBA(0x6E, 0x00, 0x40, 0xFF), RGBA(0x6C, 0x06, 0x00, 0xFF), RGBA(0x56, 0x1D, 0x00, 0xFF),
    RGBA(0x33, 0x35, 0x00, 0xFF), RGBA(0x0B, 0x48, 0x00, 0xFF), RGBA(0x00, 0x51, 0x00, 0xFF), RGBA(0x00, 0x4F, 0x08, 0xFF),
    RGBA(0x00, 0x47, 0x47, 0xFF), RGBA(0x00, 0x00, 0x00, 0xFF), RGBA(0x00, 0x00, 0x00, 0xFF), RGBA(0x00, 0x00, 0x00, 0xFF),
    
    // Sprite palette 0 (16)
    RGBA(0xAD, 0xAD, 0xAD, 0xFF), RGBA(0x15, 0x5F, 0xD9, 0xFF), RGBA(0x42, 0x40, 0xFF, 0xFF), RGBA(0x75, 0x27, 0xFE, 0xFF),
    RGBA(0xA0, 0x1E, 0xD9, 0xFF), RGBA(0xB7, 0x2F, 0xA5, 0xFF), RGBA(0xB5, 0x4A, 0x7A, 0xFF), RGBA(0x94, 0x70, 0x44, 0xFF),
    RGBA(0x79, 0x92, 0x3F, 0xFF), RGBA(0x59, 0xB1, 0x46, 0xFF), RGBA(0x4E, 0xCD, 0x54, 0xFF), RGBA(0x48, 0xD0, 0x78, 0xFF),
    RGBA(0x48, 0xD0, 0x78, 0xFF), RGBA(0x00, 0x00, 0x00, 0xFF), RGBA(0x00, 0x00, 0x00, 0xFF), RGBA(0x00, 0x00, 0x00, 0xFF),
    
    // Additional palettes...
];
```

### Teletext Color Palette

```rust
const TELETEXT_PALETTE: [RGBA; 8] = [
    RGBA(0x00, 0x00, 0x00, 0xFF),    // Black
    RGBA(0xFF, 0x00, 0x00, 0xFF),    // Red
    RGBA(0x00, 0xFF, 0x00, 0xFF),    // Green
    RGBA(0xFF, 0xFF, 0x00, 0xFF),    // Yellow
    RGBA(0x00, 0x00, 0xFF, 0xFF),    // Blue
    RGBA(0xFF, 0x00, 0xFF, 0xFF),    // Magenta
    RGBA(0x00, 0xFF, 0xFF, 0xFF),    // Cyan
    RGBA(0xFF, 0xFF, 0xFF, 0xFF),    // White
];
```

## 📺 Display Specification

### Common Display Parameters

```rust
struct DisplayConfig {
    // Resolution
    width: u16,
    height: u16,
    
    // Scaling
    scale: f32,
    aspect_ratio: f32,
    
    // Refresh rate
    refresh_rate: f32,  // Hz (50 or 60)
    
    // Overscan
    overscan: OverscanConfig,
    
    // Interlace
    interlaced: bool,
}

struct OverscanConfig {
    top: u8,
    bottom: u8,
    left: u8,
    right: u8,
    color: RGBA,
}
```

### System-Specific Display Configurations

#### C64 Display
```rust
const C64_DISPLAY: DisplayConfig = DisplayConfig {
    width: 320,
    height: 200,
    scale: 2.0,
    aspect_ratio: 4.0 / 3.0,
    refresh_rate: 60.0,  // NTSC
    overscan: OverscanConfig {
        top: 50,
        bottom: 50,
        left: 24,
        right: 24,
        color: RGBA(0x00, 0x00, 0x00, 0xFF),  // Black border
    },
    interlaced: false,
};
```

#### NES Display
```rust
const NES_DISPLAY: DisplayConfig = DisplayConfig {
    width: 256,
    height: 240,
    scale: 2.0,
    aspect_ratio: 8.0 / 7.0,
    refresh_rate: 60.0,
    overscan: OverscanConfig {
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
        color: RGBA(0x00, 0x00, 0x00, 0xFF),  // Black border
    },
    interlaced: false,
};
```

#### Teletext Display
```rust
const TELETEXT_DISPLAY: DisplayConfig = DisplayConfig {
    width: 40 * 8,   // 320 pixels
    height: 24 * 12,  // 288 pixels (12 scanlines per row)
    scale: 1.5,
    aspect_ratio: 4.0 / 3.0,
    refresh_rate: 50.0,  // PAL
    overscan: OverscanConfig {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        color: RGBA(0x00, 0x00, 0x00, 0xFF),  // Black border
    },
    interlaced: true,  // Teletext uses interlace
};
```

## 🎮 UDX Integration Specification

### UDX Format Extension for Retro Systems

```json
{
    "version": "2.0",
    "type": "retro-dashboard",
    "title": "Retro System Dashboard",
    "retro_system": "c64",  // c64, nes, teletext
    "display": {
        "border_color": 6,      // C64 color index
        "border_visible": true,
        "color_cycling": {
            "enabled": true,
            "speed": 2.0,
            "colors": [1, 2, 3, 4, 5]
        }
    },
    "blocks": [
        {
            "type": "teletext-grid",
            "extra": {
                "content": "HELLO WORLD",
                "position": [10, 5],  // x, y
                "color": 1,           // Red
                "background": 0       // Black
            }
        },
        {
            "type": "c64-gauge",
            "extra": {
                "label": "CPU USAGE",
                "value": 75,
                "position": [5, 10],
                "colors": [1, 2, 3]  // Red, Cyan, Purple
            }
        }
    ]
}
```

### Block Type Specifications

#### Teletext Grid Block
```json
{
    "type": "teletext-grid",
    "extra": {
        "content": "String content",
        "position": [x, y],      // Character position
        "color": 1,              // Foreground color index
        "background": 0,         // Background color index
        "flashing": false,       // Flashing text
        "double_height": false, // Double height
        "double_width": false,  // Double width
        "graphics": false        // Use block graphics
    }
}
```

#### C64 Gauge Block
```json
{
    "type": "c64-gauge",
    "extra": {
        "label": "Metric Name",
        "value": 75,            // 0-100%
        "position": [x, y],     // Character position
        "width": 20,            // Characters wide
        "colors": [1, 2, 3],    // Color indices for gradient
        "border": true,         // Show border
        "fill_char": 112       // PETSCII block character
    }
}
```

#### NES Status Block
```json
{
    "type": "nes-status",
    "extra": {
        "label": "STATUS",
        "value": "READY",
        "position": [x, y],
        "palette": 0,         // NES palette index
        "button_style": true,  // Show as button
        "pointer": true        // Show pointer arrow
    }
}
```

## 🚀 Implementation Strategy

### Phase 1: Core Engine (Blitz/Rust)
1. **Character Grid System**
   - Fixed 40×25 grid baseline
   - 8×8 pixel characters
   - Screen memory management

2. **Color Palette System**
   - 16-color baseline (expandable)
   - System-specific palettes
   - Color RAM simulation

3. **Font System**
   - PETSCII font implementation
   - NES tile font
   - Teletext glyphs
   - Custom font support

### Phase 2: System Modules
1. **C64 Module**
   - Border system with color cycling
   - PETSCII character set
   - VIC-II emulation basics

2. **NES Module**
   - Attribute table system
   - Sprite system
   - PPU emulation basics

3. **Teletext Module**
   - Block graphics
   - Page system
   - Transmission simulation

### Phase 3: CRT Effects
1. **Scanline Generator**
2. **Phosphor Shader**
3. **Curvature Effects**
4. **Color Bleeding**
5. **Flicker Simulation**

### Phase 4: ThinUI Integration
1. **UDX Parser Extension**
2. **Block Type Mapping**
3. **Theme Switching**
4. **Performance Optimization**

### Phase 5: Polish & Extensions
1. **WebGL Acceleration**
2. **Mobile Optimization**
3. **Custom System Support**
4. **Documentation & Examples**

## 📁 File Structure Proposal

```
retro-core/
├── src/
│   ├── lib.rs                # Main library
│   ├── grid/                 # Grid system
│   │   ├── mod.rs
│   │   ├── character.rs
│   │   ├── screen_memory.rs
│   │   └── color_ram.rs
│   ├── fonts/                # Font systems
│   │   ├── mod.rs
│   │   ├── petscii.rs
│   │   ├── nes_font.rs
│   │   ├── teletext.rs
│   │   └── custom.rs
│   ├── crt/                  # CRT effects
│   │   ├── mod.rs
│   │   ├── scanlines.rs
│   │   ├── phosphor.rs
│   │   ├── curvature.rs
│   │   └── shaders.rs
│   ├── systems/              # System modules
│   │   ├── mod.rs
│   │   ├── c64/
│   │   │   ├── mod.rs
│   │   │   ├── border.rs
│   │   │   └── vic_ii.rs
│   │   ├── nes/
│   │   │   ├── mod.rs
│   │   │   ├── ppu.rs
│   │   │   └── attributes.rs
│   │   └── teletext/
│   │       ├── mod.rs
│   │       ├── blocks.rs
│   │       └── pages.rs
│   └── renderer.rs           # Main renderer
├── examples/                # Example implementations
│   ├── c64_demo.rs
│   ├── nes_demo.rs
│   └── teletext_demo.rs
├── tests/                   # Unit tests
│   ├── grid_tests.rs
│   ├── font_tests.rs
│   └── crt_tests.rs
├── Cargo.toml
└── README.md
```

## 🎯 Next Steps

1. **Set up Blitz project** with proper structure
2. **Implement character grid system** (40×25 baseline)
3. **Create PETSCII font** with accurate glyphs
4. **Implement color palette system** with C64 colors
5. **Build basic renderer** with canvas output
6. **Add CRT scanline effect**
7. **Integrate with ThinUI** UDX format

Would you like me to start implementing this specification? I can begin with the core character grid system and PETSCII font, which will give us the authentic C64 look you're after.
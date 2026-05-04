//! ThinHandler - A unified handler architecture for ThinUI
//!
//! This crate provides the core ThinHandler pattern for managing
//! commands, state, and rendering in a decoupled, extensible way.

use thiserror::Error;

pub mod renderers;
pub mod state;
pub mod backends;

pub use renderers::*;
pub use state::*;
pub use backends::*;

/// Main ThinHandler struct that orchestrates the entire system
pub struct ThinHandler {
    state_manager: StateManager,
    renderer_registry: RendererRegistry,
    current_renderer: Option<RendererType>,
    backend: Box<dyn Backend>,
}

impl ThinHandler {
    /// Create a new ThinHandler with default configuration
    pub fn new(backend: Box<dyn Backend>) -> Self {
        Self {
            state_manager: StateManager::new(),
            renderer_registry: RendererRegistry::new(),
            current_renderer: None,
            backend,
        }
    }

    /// Initialize the handler system
    pub fn initialize(&mut self) -> Result<(), HandlerError> {
        log::info!("Initializing ThinHandler...");
        
        // Initialize backend
        self.backend.initialize()?;
        
        // Set default renderer if none is set
        if self.current_renderer.is_none() {
            self.set_renderer(RendererType::JavaScript)?;
        }
        
        Ok(())
    }

    /// Handle a command
    pub fn handle_command(&mut self, command: Command) -> Result<(), HandlerError> {
        log::debug!("Handling command: {:?}", command);
        
        match command {
            Command::ConnectCore => {
                self.backend.connect_core()?;
                self.state_manager.update_state(AppState {
                    connected: true,
                    ..self.state_manager.current_state()
                });
            }
            Command::Disconnect => {
                self.backend.disconnect()?;
                self.state_manager.update_state(AppState {
                    connected: false,
                    ..self.state_manager.current_state()
                });
            }
            Command::LoadDashboard(filename) => {
                let dashboard = self.backend.load_dashboard(&filename)?;
                self.state_manager.update_state(AppState {
                    current_dashboard: Some(filename),
                    dashboard_data: Some(dashboard),
                    ..self.state_manager.current_state()
                });
            }
            Command::SetRenderer(renderer_type) => {
                self.set_renderer(renderer_type)?;
            }
            Command::UpdateTheme(theme) => {
                self.state_manager.update_state(AppState {
                    theme: Some(theme),
                    ..self.state_manager.current_state()
                });
            }
        }
        
        Ok(())
    }

    /// Set the current renderer
    pub fn set_renderer(&mut self, renderer_type: RendererType) -> Result<(), HandlerError> {
        if !self.renderer_registry.has_renderer(renderer_type) {
            return Err(HandlerError::RendererNotAvailable(renderer_type));
        }
        
        self.current_renderer = Some(renderer_type);
        log::info!("Renderer set to: {:?}", renderer_type);
        
        Ok(())
    }

    /// Register a renderer
    pub fn register_renderer(&mut self, renderer_type: RendererType, renderer: Box<dyn Renderer>) {
        self.renderer_registry.register(renderer_type, renderer);
    }

    /// Render the current state
    pub fn render(&mut self) -> Result<(), HandlerError> {
        let current_state = self.state_manager.current_state();
        
        if let Some(renderer_type) = self.current_renderer {
            if let Some(renderer) = self.renderer_registry.get_renderer(renderer_type) {
                renderer.render(&current_state)?;
            }
        }
        
        Ok(())
    }

    /// Get the current state
    pub fn current_state(&self) -> AppState {
        self.state_manager.current_state()
    }

    /// Subscribe to state changes
    pub fn subscribe_to_state(&mut self, subscriber: Box<dyn StateSubscriber>) {
        self.state_manager.subscribe(subscriber);
    }
}

/// Backend trait for platform-specific operations
pub trait Backend: Send + Sync {
    fn initialize(&mut self) -> Result<(), HandlerError>;
    fn connect_core(&mut self) -> Result<(), HandlerError>;
    fn disconnect(&mut self) -> Result<(), HandlerError>;
    fn load_dashboard(&mut self, filename: &str) -> Result<serde_json::Value, HandlerError>;
}

/// Error type for ThinHandler operations
#[derive(Error, Debug)]
pub enum HandlerError {
    #[error("Backend error: {0}")]
    BackendError(String),
    
    #[error("Renderer not available: {0:?}")]
    RendererNotAvailable(RendererType),
    
    #[error("Render error: {0}")]
    RenderError(String),
    
    #[error("State management error: {0}")]
    StateError(String),
}

/// Command enum for all supported operations
#[derive(Debug, Clone)]
pub enum Command {
    ConnectCore,
    Disconnect,
    LoadDashboard(String),
    SetRenderer(RendererType),
    UpdateTheme(Theme),
}

/// Renderer types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum RendererType {
    JavaScript,
    Wasm,
    WebGL,
    Svg,
}

/// Theme enum
#[derive(Debug, Clone, PartialEq)]
pub enum Theme {
    Modern,
    Retro,
    Dark,
    Light,
    Custom(String),
}

/// Application state
#[derive(Debug, Clone, Default)]
pub struct AppState {
    pub connected: bool,
    pub current_dashboard: Option<String>,
    pub dashboard_data: Option<serde_json::Value>,
    pub theme: Option<Theme>,
    pub renderer: Option<RendererType>,
    // Add more state fields as needed
}

/// Renderer trait
pub trait Renderer: Send + Sync {
    fn render(&self, state: &AppState) -> Result<(), HandlerError>;
    fn get_capabilities(&self) -> RendererCapabilities;
}

/// Renderer capabilities
#[derive(Debug, Clone)]
pub struct RendererCapabilities {
    pub supports_animation: bool,
    pub supports_3d: bool,
    pub max_texture_size: u32,
    pub preferred_format: String,
}

impl Default for RendererCapabilities {
    fn default() -> Self {
        Self {
            supports_animation: true,
            supports_3d: false,
            max_texture_size: 2048,
            preferred_format: "rgba8".to_string(),
        }
    }
}

/// State subscriber trait
pub trait StateSubscriber: Send + Sync {
    fn on_state_change(&mut self, new_state: &AppState);
}
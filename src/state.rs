use crate::{AppState, StateSubscriber};
use std::sync::{Arc, Mutex};

/// State manager for handling application state
pub struct StateManager {
    current_state: Arc<Mutex<AppState>>,
    subscribers: Arc<Mutex<Vec<Box<dyn StateSubscriber>>>>,
}

impl StateManager {
    /// Create a new StateManager with default state
    pub fn new() -> Self {
        Self {
            current_state: Arc::new(Mutex::new(AppState::default())),
            subscribers: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Get the current state
    pub fn current_state(&self) -> AppState {
        self.current_state.lock().unwrap().clone()
    }

    /// Update the state and notify subscribers
    pub fn update_state(&self, new_state: AppState) {
        let mut state = self.current_state.lock().unwrap();
        *state = new_state;
        
        // Notify subscribers
        let mut subscribers = self.subscribers.lock().unwrap();
        for subscriber in subscribers.iter_mut() {
            subscriber.on_state_change(&state);
        }
    }

    /// Subscribe to state changes
    pub fn subscribe(&self, subscriber: Box<dyn StateSubscriber>) {
        self.subscribers.lock().unwrap().push(subscriber);
    }
}

impl Default for StateManager {
    fn default() -> Self {
        Self::new()
    }
}
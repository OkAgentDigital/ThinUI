use std::path::PathBuf;
use shellexpand::tilde;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      connect_core,
      disconnect,
      load_udx_from_vault
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn connect_core() -> Result<String, String> {
  Ok("Connected to core".to_string())
}

#[tauri::command]
async fn disconnect() -> Result<String, String> {
  Ok("Disconnected".to_string())
}

#[tauri::command]
async fn load_udx_from_vault(filename: String) -> Result<serde_json::Value, String> {
  let vault_path_str = tilde("~/Vault/.udx");
  let vault_path = PathBuf::from(vault_path_str.into_owned());
  let file_path = vault_path.join(&filename);
  
  if !file_path.exists() {
    return Err(format!("File not found: {}", file_path.display()));
  }
  
  let content = std::fs::read_to_string(file_path)
    .map_err(|e| format!("Failed to read file: {}", e))?;
  
  serde_json::from_str(&content)
    .map_err(|e| format!("Failed to parse UDX: {}", e))
}

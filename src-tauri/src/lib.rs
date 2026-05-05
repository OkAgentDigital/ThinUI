use std::path::PathBuf;
use std::process::Command;
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
      load_udx_from_vault,
      set_setting,
      get_setting,
      check_for_updates,
      get_version
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

// ── Dogfooding: Settings & Auto-Launch ──

/// Persist a setting key/value pair.
#[tauri::command]
fn set_setting(key: String, value: String) -> Result<(), String> {
    // For auto_launch, register/unregister the login item
    if key == "auto_launch" {
        let enabled = value == "true";
        set_auto_launch(enabled)?;
    }
    // Other settings are handled by the frontend via localStorage
    Ok(())
}

/// Get a stored setting.
#[tauri::command]
fn get_setting(_key: String) -> Result<String, String> {
    // Settings are primarily in localStorage on the frontend
    // This is a bridge for future native settings storage
    Ok(String::new())
}

/// Check GitHub for newer GiftWrapper releases.
#[tauri::command]
async fn check_for_updates() -> Result<serde_json::Value, String> {
    let url = "https://api.github.com/repos/OkAgentDigital/ThinUI/releases/latest";
    let client = reqwest::Client::builder()
        .user_agent("GiftWrapper/1.0")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    
    let resp = client
        .get(url)
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await
        .map_err(|e| format!("Failed to check for updates: {}", e))?;
    
    let body = resp
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    serde_json::from_str(&body)
        .map_err(|e| format!("Failed to parse release info: {}", e))
}

/// Get the current GiftWrapper version.
#[tauri::command]
fn get_version() -> String {
    let pkg = env!("CARGO_PKG_VERSION", "1.0.0");
    format!("v{}", pkg)
}

/// Enable or disable auto-launch via launchd.
fn set_auto_launch(enabled: bool) -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|_| "No HOME".to_string())?;
    let plist_path = format!("{}/Library/LaunchAgents/com.okagentdigital.giftwrapper.plist", home);
    
    if enabled {
        let plist = format!(r##"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
    <key>Label</key><string>com.okagentdigital.giftwrapper</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/zsh</string>
        <string>-c</string>
        <string>open -a GiftWrapper</string>
    </array>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key><false/>
</dict></plist>
"##);
        std::fs::write(&plist_path, plist).map_err(|e| format!("Failed to write plist: {}", e))?;
        
        Command::new("launchctl")
            .args(["load", &plist_path])
            .output()
            .map_err(|e| format!("Failed to load launch agent: {}", e))?;
    } else {
        if std::path::Path::new(&plist_path).exists() {
            Command::new("launchctl")
                .args(["unload", &plist_path])
                .output()
                .ok();
            std::fs::remove_file(&plist_path).ok();
        }
    }
    
    Ok(())
}

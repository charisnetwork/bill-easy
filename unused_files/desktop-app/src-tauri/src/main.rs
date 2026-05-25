// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            // Get app data directory for database storage
            let app_dir = app.path_resolver().app_data_dir().expect("Failed to get app dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app dir");
            
            println!("App data directory: {:?}", app_dir);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

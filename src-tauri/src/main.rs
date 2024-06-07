// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sav::SavManager;

mod sav;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn select_sav_file(sav_file_path: &str) -> Result<(), String> {
    SavManager::global().lock().unwrap().add_sav(sav_file_path)
}

#[tauri::command]
fn get_all_sav() -> Result<Vec<sav::SavInfo>, String> {
    Ok(SavManager::global().lock().unwrap().get_all_sav())
}

#[tauri::command]
fn save_sav_file(sav_file_path: &str) -> Result<(), String> {
    SavManager::global()
        .lock()
        .unwrap()
        .save_as_file(sav_file_path)
}

#[tauri::command]
fn set_cur_sav(cur_sav_index: usize) -> usize {
    println!("index of current seleted sav file: {}", cur_sav_index);
    SavManager::global().lock().unwrap().cur_sav = cur_sav_index;
    println!(
        "index of current seleted sav file: {}",
        SavManager::global().lock().unwrap().cur_sav
    );
    SavManager::global().lock().unwrap().cur_sav
}

#[tauri::command]
fn get_cur_sav() -> usize {
    SavManager::global().lock().unwrap().cur_sav
}

#[tauri::command]
fn get_vault() -> Result<String, String> {
    let sav_manager = SavManager::global().lock().unwrap();
    let sav_json = sav_manager.get_cur_sav_json().map_err(|e| e)?;

    Ok(sav_json["vault"].to_string())
}

#[tauri::command]
fn set_vault(vault: String) -> Result<(), String> {
    let mut sav_manager = SavManager::global().lock().unwrap();
    let sav_json = sav_manager.get_mut_cur_sav_json().map_err(|e| e)?;

    sav_json["vault"] =
        serde_json::from_str(vault.as_str()).map_err(|_| "parse json failed".to_string())?;

    Ok(())
}

#[tauri::command]
fn get_dwellers() -> Result<String, String> {
    let sav_manager = SavManager::global().lock().unwrap();
    let sav_json = sav_manager.get_cur_sav_json().map_err(|e| e)?;

    Ok(sav_json["dwellers"]["dwellers"].to_string())
}

#[tauri::command]
fn set_dwellers(dwellers: String) -> Result<(), String> {
    let mut sav_manager = SavManager::global().lock().unwrap();
    let sav_json = sav_manager.get_mut_cur_sav_json().map_err(|e| e)?;

    sav_json["dwellers"]["dwellers"] =
        serde_json::from_str(dwellers.as_str()).map_err(|_| "parse json failed".to_string())?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            select_sav_file,
            get_all_sav,
            save_sav_file,
            set_cur_sav,
            get_cur_sav,
            get_vault,
            set_vault,
            get_dwellers,
            set_dwellers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

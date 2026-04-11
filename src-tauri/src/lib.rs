use commands::CliArgState;
use std::sync::Mutex;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let args: Vec<String> = std::env::args().collect();
    // args[0] is the binary name; args[1] (if present) is the user's path argument
    let user_arg = args.get(1).cloned();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(CliArgState(Mutex::new(user_arg)))
        .invoke_handler(tauri::generate_handler![
            commands::list_md_files,
            commands::read_file,
            commands::get_startup_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

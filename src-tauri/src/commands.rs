use std::fs;
use std::path::Path;
use tauri::State;

#[derive(serde::Serialize)]
pub struct DirEntry {
    pub path: String,
    pub kind: String, // "file" or "directory"
}

/// Lists subdirectories and `.md` files in `dir` (non-recursive, top-level only).
/// Directories come first, then files, each group sorted by name.
#[tauri::command]
pub fn list_entries(dir: String) -> Result<Vec<DirEntry>, String> {
    let path = Path::new(&dir);
    if !path.is_dir() {
        return Err(format!("Not a directory: {}", dir));
    }
    let raw = fs::read_dir(path).map_err(|e| e.to_string())?;
    let mut dirs: Vec<DirEntry> = Vec::new();
    let mut files: Vec<DirEntry> = Vec::new();
    for entry in raw.filter_map(|e| e.ok()) {
        let p = entry.path();
        let Some(path_str) = p.to_str().map(String::from) else { continue };
        if p.is_dir() {
            dirs.push(DirEntry { path: path_str, kind: "directory".to_string() });
        } else if p.is_file() && p.extension().and_then(|e| e.to_str()) == Some("md") {
            files.push(DirEntry { path: path_str, kind: "file".to_string() });
        }
    }
    dirs.sort_by(|a, b| {
        Path::new(&a.path).file_name().unwrap_or_default()
            .cmp(Path::new(&b.path).file_name().unwrap_or_default())
    });
    files.sort_by(|a, b| {
        Path::new(&a.path).file_name().unwrap_or_default()
            .cmp(Path::new(&b.path).file_name().unwrap_or_default())
    });
    dirs.extend(files);
    Ok(dirs)
}

pub struct CliArgState(pub std::sync::Mutex<Option<String>>);

#[derive(serde::Serialize)]
pub struct StartupInfo {
    pub cli_arg_file: Option<String>,
    pub cli_arg_dir: Option<String>,
    pub home_dir: String,
    pub cwd: String,
}

/// Lists all `.md` files in the given directory (non-recursive, top-level only).
/// Returns full paths, sorted by filename.
#[tauri::command]
pub fn list_md_files(dir: String) -> Result<Vec<String>, String> {
    let path = Path::new(&dir);
    if !path.is_dir() {
        return Err(format!("Not a directory: {}", dir));
    }
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
    let mut files: Vec<String> = entries
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.is_file() && p.extension().and_then(|e| e.to_str()) == Some("md"))
        .filter_map(|p| p.to_str().map(String::from))
        .collect();
    files.sort_by(|a, b| {
        let a_name = Path::new(a).file_name().unwrap_or_default();
        let b_name = Path::new(b).file_name().unwrap_or_default();
        a_name.cmp(b_name)
    });
    Ok(files)
}

const MAX_FILE_BYTES: u64 = 10 * 1024 * 1024; // 10 MB

/// Returns "file", "directory", or "not_found" for a given path.
#[tauri::command]
pub fn get_path_type(path: String) -> String {
    let p = Path::new(&path);
    if p.is_file() {
        "file".to_string()
    } else if p.is_dir() {
        "directory".to_string()
    } else {
        "not_found".to_string()
    }
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let p = Path::new(&path);
    if p.extension().and_then(|e| e.to_str()) != Some("md") {
        return Err("Only .md files can be read".to_string());
    }
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    if meta.len() > MAX_FILE_BYTES {
        return Err(format!("File exceeds the 10 MB size limit ({} bytes)", meta.len()));
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_startup_info(state: State<CliArgState>) -> Result<StartupInfo, String> {
    let raw_arg = state.0.lock().map_err(|_| "state lock failed".to_string())?.clone();
    let home_dir = dirs::home_dir()
        .and_then(|p| p.to_str().map(String::from))
        .unwrap_or_else(|| String::new());

    let (cli_arg_file, cli_arg_dir) = match raw_arg {
        None => (None, None),
        Some(arg) => {
            let p = Path::new(&arg);
            if p.is_file() {
                (Some(arg), None)
            } else if p.is_dir() {
                (None, Some(arg))
            } else {
                (None, None)
            }
        }
    };

    let cwd = std::env::current_dir()
        .ok()
        .and_then(|p| p.to_str().map(String::from))
        .unwrap_or_else(|| home_dir.clone());

    Ok(StartupInfo { cli_arg_file, cli_arg_dir, home_dir, cwd })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_list_md_files_returns_only_md_files() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("notes.md"), "# Hello").unwrap();
        fs::write(dir.path().join("notes.txt"), "not md").unwrap();
        fs::write(dir.path().join("readme.md"), "# Readme").unwrap();

        let result = list_md_files(dir.path().to_str().unwrap().to_string()).unwrap();
        assert_eq!(result.len(), 2);
        assert!(result.iter().all(|f| f.ends_with(".md")));
    }

    #[test]
    fn test_list_md_files_sorted() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("z.md"), "").unwrap();
        fs::write(dir.path().join("a.md"), "").unwrap();

        let result = list_md_files(dir.path().to_str().unwrap().to_string()).unwrap();
        assert_eq!(result.len(), 2);
        assert!(result[0].ends_with("a.md"), "expected a.md first, got {:?}", result[0]);
        assert!(result[1].ends_with("z.md"), "expected z.md second, got {:?}", result[1]);
    }

    #[test]
    fn test_list_md_files_error_on_nonexistent_dir() {
        let result = list_md_files("/nonexistent/path/xyz123".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_list_md_files_empty_dir() {
        let dir = TempDir::new().unwrap();
        let result = list_md_files(dir.path().to_str().unwrap().to_string()).unwrap();
        assert_eq!(result.len(), 0);
    }

    #[test]
    fn test_read_file_returns_content() {
        let dir = TempDir::new().unwrap();
        let file = dir.path().join("test.md");
        fs::write(&file, "# Hello\nWorld").unwrap();

        let content = read_file(file.to_str().unwrap().to_string()).unwrap();
        assert_eq!(content, "# Hello\nWorld");
    }

    #[test]
    fn test_read_file_error_on_nonexistent_file() {
        let result = read_file("/nonexistent/file.md".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_read_file_rejects_non_md_extension() {
        let dir = TempDir::new().unwrap();
        let file = dir.path().join("secret.txt");
        fs::write(&file, "sensitive data").unwrap();
        let result = read_file(file.to_str().unwrap().to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Only .md files"));
    }

    #[test]
    fn test_read_file_rejects_oversized_file() {
        let dir = TempDir::new().unwrap();
        let file = dir.path().join("big.md");
        // Write just over 10 MB
        let big = vec![b'a'; 10 * 1024 * 1024 + 1];
        fs::write(&file, &big).unwrap();
        let result = read_file(file.to_str().unwrap().to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("size limit"));
    }
}

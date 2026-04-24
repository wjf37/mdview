# mdview

A lightweight desktop markdown viewer built with Tauri. Open `.md` files with proper formatting — tables, syntax-highlighted code blocks, task checkboxes, and dark/light mode.

## Features

- Browse a directory's markdown files and subdirectories, navigate into folders
- Renders GitHub Flavored Markdown: headings, tables, task checkboxes, strikethrough, fenced code blocks
- Syntax highlighting for 20+ languages via highlight.js
- Dark/light mode toggle (persists across sessions); defaults to OS preference
- Hidden files and folders filtered by default — right-click to show them
- Open a file or directory directly from the command line
- Opens to the directory you launched from
- Lightweight — ~13MB installed binary, no Electron

## Install from a release

Download the latest pre-built binary from [GitHub Releases](../../releases):

- **Linux** — `.deb` (Debian/Ubuntu) or `.AppImage` (any distro)
- **Windows** — portable `.exe` (recommended) or `.msi` installer

**Windows note:** The binaries are unsigned. If Windows Defender quarantines the file, prefer the portable `.exe` over the `.msi` — it avoids the installer heuristics that commonly trigger false positives. If Defender still blocks it, add an exclusion for your Downloads folder or [submit a false positive report](https://www.microsoft.com/en-us/wdsi/filesubmission).

## Build from source

### Prerequisites — Linux

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 24+
- System libraries:

```bash
sudo apt-get install -y pkg-config libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### Prerequisites — Windows

- [Rust](https://rustup.rs/) (stable) — choose the `x86_64-pc-windows-msvc` toolchain when prompted
- [Node.js](https://nodejs.org/) 24+
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — select the **Desktop development with C++** workload
- WebView2 Runtime — pre-installed on Windows 10 (1803+) and Windows 11

### Install — Linux

Build and install the binary to `~/.local/bin`:

```bash
npm install
npm run install:local
```

If `~/.local/bin` is not on your PATH, the script will tell you what to add to your `~/.bashrc` or `~/.zshrc`.

### Install — Windows

Run the following in a PowerShell terminal from the project directory:

```powershell
npm install
npm run install:windows
```

This builds the app and copies `mdview.exe` to `%LOCALAPPDATA%\Programs\mdview\`. If that directory isn't on your PATH, the script will print the exact command to add it. Run that command, then restart your terminal.

### Update — Linux

```bash
npm run update
```

### Update — Windows

```powershell
npm run update:windows
```

## Usage

```bash
mdview                       # browse from current directory
mdview ~/documents           # browse a specific directory
mdview ~/documents/notes.md  # open a file directly
```

### Browse view

- Click a folder to navigate into it
- Click a `.md` file to open it in the reader
- Click **Open** to pick any `.md` file or directory from a file dialog
- Right-click anywhere in the browse view to toggle visibility of hidden files and folders

### Reader view

- Click **← Back** to return to the directory listing
- The dark/light mode toggle sits in the bottom-right corner

## Development

Start the Tauri dev server with hot-reload:

```bash
npm run tauri dev
```

## Building

```bash
# Linux
npm run build:linux
# Output: src-tauri/target/release/mdview

# Windows
npm run build:windows
# Output: src-tauri/target/release/mdview.exe
```

## Tech Stack

- [Tauri v2](https://tauri.app/) — native desktop shell
- [Rust](https://www.rust-lang.org/) — file system backend
- Vanilla TypeScript + Vite — frontend, no framework
- [marked](https://marked.js.org/) — markdown rendering
- [highlight.js](https://highlightjs.org/) — syntax highlighting

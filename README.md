# mdview

A lightweight desktop markdown viewer built with Tauri. Open `.md` files with proper formatting — tables, syntax-highlighted code blocks, task checkboxes, and automatic dark/light mode.

## Features

- Browse a directory's markdown files and open them with a click
- Renders GitHub Flavored Markdown: headings, tables, task checkboxes, strikethrough, fenced code blocks
- Syntax highlighting for 20+ languages via highlight.js
- Automatic dark/light mode following OS preference
- Open a file or directory directly from the command line
- Lightweight — ~13MB installed binary, no Electron

## Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- Linux system libraries for Tauri:

```bash
sudo apt-get install -y pkg-config libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

## Install

Build and install the binary to `~/.local/bin`:

```bash
npm install
npm run install:local
```

If `~/.local/bin` is not on your PATH, the script will tell you what to add to your `~/.bashrc` or `~/.zshrc`.

## Usage

```bash
mdview                     # browse from home directory
mdview ~/documents         # browse a specific directory
mdview ~/documents/notes.md  # open a file directly
```

## Development

Start the Tauri dev server with hot-reload:

```bash
npm run tauri dev
```

## Building

Build an optimised release binary (also produces `.deb`, `.rpm`, and `.AppImage` bundles):

```bash
npm run build:linux
```

Output: `src-tauri/target/release/mdview`

## Tech Stack

- [Tauri v2](https://tauri.app/) — native desktop shell
- [Rust](https://www.rust-lang.org/) — file system backend
- Vanilla TypeScript + Vite — frontend, no framework
- [marked](https://marked.js.org/) — markdown rendering
- [highlight.js](https://highlightjs.org/) — syntax highlighting

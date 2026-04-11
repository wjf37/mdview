# mdview — Design Spec

**Date:** 2026-04-11

## Overview

A lightweight native desktop markdown viewer built with Tauri. Opens `.md` files with proper formatting including syntax-highlighted code blocks, tables, and task checkboxes. Follows OS dark/light mode. Also ships a terminal TUI as a nice-to-have.

---

## Stack

- **Shell:** Tauri (Rust backend, minimal — no custom Rust logic beyond Tauri commands)
- **Frontend:** Vanilla TypeScript + HTML + CSS (no framework)
- **Markdown rendering:** `marked` (with GFM extensions for tables, task checkboxes)
- **Syntax highlighting:** `highlight.js`
- **Build tool:** Vite (standard Tauri scaffolding)

---

## Views

Two views managed by client-side JS state (no router):

### Browse View
- Shows the current directory name
- Lists all `.md` files in that directory (shows filename only, stores full path for opening)
- Clicking a file opens the Reader view
- A "Open Folder" button triggers the OS folder picker dialog to switch directories

### Reader View
- Renders the selected file as HTML via `marked`
- Syntax highlighting via `highlight.js` (applied post-render)
- A "Back" button returns to the Browse view
- The window title is set to the filename

### CLI Launch Behavior
- `mdview path/to/file.md` → skips Browse, opens Reader directly
- `mdview path/to/dir` → opens Browse view scoped to that directory
- No argument → opens Browse view at the user's home directory

---

## Tauri Commands (Rust → TS bridge)

| Command | Signature | Description |
|---|---|---|
| `list_md_files` | `(dir: string) → string[]` | Returns full paths of all `.md` files in the given directory |
| `read_file` | `(path: string) → string` | Returns raw markdown content of the file |
| `get_cli_arg` | `() → string \| null` | Returns the CLI argument passed at launch, or null |

All filesystem access goes through these commands. The frontend never accesses the filesystem directly.

---

## Styling

- No CSS framework
- Fixed max-width content area (~800px), centered
- System font stack
- `prefers-color-scheme` media query for automatic dark/light mode
- `highlight.js` theme matched to the active color scheme (e.g., GitHub Light / GitHub Dark)
- No animations, no custom fonts

---

## Markdown Features (Extended — GFM subset)

- Headings, bold, italic, strikethrough
- Ordered and unordered lists
- Task checkboxes (`- [ ]` / `- [x]`)
- Tables
- Fenced code blocks with syntax highlighting
- Inline code
- Blockquotes
- Links
- Images

HTML passthrough is disabled (security: content is untrusted local files but keeping it simple).

---

## Error Handling

- Directory not found or unreadable: show an inline error message in the Browse view, stay on the view
- File not found or unreadable: show an inline error in the Reader view with a Back button
- No `.md` files in directory: show a "No markdown files found" message in the Browse view
- CLI arg points to nonexistent path: treat as no argument (open Browse at home directory)

---

## Nice-to-Have: Terminal TUI

A separate binary (`mdview-tui`) built with a Rust TUI library (e.g., `ratatui`). Same behavior:
- `mdview-tui file.md` → render and display the file in-terminal
- `mdview-tui dir/` → show a navigable file list, select to view
- Keyboard navigation (arrow keys, `q` to quit, `b` to go back)

This is explicitly out of scope for v1 and tracked as a follow-up.

---

## Out of Scope (v1)

- Search within files or across files
- Persistent state (last opened file/folder)
- Tabs or multi-file views
- Editing
- File watching / live reload
- Terminal TUI (tracked as v2)

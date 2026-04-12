# mdview Linux Install Design Spec

**Date:** 2026-04-12

## Overview

Add a build-and-install workflow so `mdview` can be run from any terminal on Linux with just the `mdview` keyword. The binary is installed to `~/.local/bin/mdview` (user-level, no sudo required).

Windows is out of scope for now and tracked as a future follow-up.

---

## Changes

### `package.json` — two new scripts

```json
"build:linux": "npm run tauri build",
"install:local": "npm run build:linux && bash scripts/install.sh"
```

- `build:linux` produces `src-tauri/target/release/mdview` — a self-contained executable with no runtime dependencies on Node or Vite
- `install:local` builds then runs the install script

### `scripts/install.sh` — install script

Bash script that:

1. **Ensures `~/.local/bin` exists** — `mkdir -p ~/.local/bin`
2. **Exits with error if binary missing** — if `src-tauri/target/release/mdview` doesn't exist, print an error and exit 1
3. **Copies and marks executable** — `cp src-tauri/target/release/mdview ~/.local/bin/mdview && chmod +x ~/.local/bin/mdview`
4. **PATH check** — if `~/.local/bin` is not in `$PATH`, print a warning with the exact line to add:
   ```
   export PATH="$HOME/.local/bin:$PATH"
   ```
   and remind the user to add it to `~/.bashrc` or `~/.zshrc`
5. **Success message** — prints `mdview installed to ~/.local/bin/mdview`

---

## Usage

```bash
# Build and install in one step
npm run install:local

# Then in any new terminal:
mdview                          # opens browse view at home directory
mdview ~/docs                   # opens browse view at ~/docs
mdview ~/docs/README.md         # opens reader view directly
```

---

## Out of Scope

- Windows build (tracked as future follow-up)
- System-wide install (`/usr/local/bin`)
- Uninstall script
- Auto-updating

# Linux Install Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `npm run install:local` which builds the Tauri app and installs the `mdview` binary to `~/.local/bin/mdview` so it can be run from any terminal.

**Architecture:** Two changes: new npm scripts in `package.json` that invoke `npm run tauri build` and then a bash install script; and `scripts/install.sh` which copies the built binary, ensures `~/.local/bin` exists, and warns if it isn't on `$PATH`.

**Tech Stack:** Bash, npm scripts, Tauri CLI

---

## File Structure

```
mdview/
├── package.json              # Add build:linux and install:local scripts
└── scripts/
    └── install.sh            # New: build, copy, PATH check, success message
```

---

## Task 1: Add npm scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the two new scripts to `package.json`**

Open `/home/vinw37/mdview/package.json`. In the `"scripts"` section, add `build:linux` and `install:local` so the full scripts block reads:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "tauri": "tauri",
  "build:linux": "npm run tauri build",
  "install:local": "npm run build:linux && bash scripts/install.sh"
}
```

- [ ] **Step 2: Verify the scripts are valid JSON**

```bash
cd /home/vinw37/mdview && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
cd /home/vinw37/mdview
git add package.json
git commit -m "feat: add build:linux and install:local npm scripts"
```

---

## Task 2: Create install script

**Files:**
- Create: `scripts/install.sh`

- [ ] **Step 1: Create the `scripts/` directory**

```bash
mkdir -p /home/vinw37/mdview/scripts
```

- [ ] **Step 2: Create `scripts/install.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

BINARY="src-tauri/target/release/mdview"
INSTALL_DIR="$HOME/.local/bin"
INSTALL_PATH="$INSTALL_DIR/mdview"

# Verify the binary was built
if [ ! -f "$BINARY" ]; then
  echo "Error: binary not found at $BINARY" >&2
  echo "Run 'npm run build:linux' first." >&2
  exit 1
fi

# Ensure install directory exists
mkdir -p "$INSTALL_DIR"

# Copy binary and make executable
cp "$BINARY" "$INSTALL_PATH"
chmod +x "$INSTALL_PATH"

# Check PATH and warn if needed
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo ""
  echo "Warning: $INSTALL_DIR is not in your PATH."
  echo "Add the following line to your ~/.bashrc or ~/.zshrc:"
  echo ""
  echo '  export PATH="$HOME/.local/bin:$PATH"'
  echo ""
  echo "Then run: source ~/.bashrc   (or open a new terminal)"
fi

echo "mdview installed to $INSTALL_PATH"
```

- [ ] **Step 3: Make the script executable**

```bash
chmod +x /home/vinw37/mdview/scripts/install.sh
```

- [ ] **Step 4: Verify the script is valid bash (dry run)**

```bash
bash -n /home/vinw37/mdview/scripts/install.sh && echo "syntax ok"
```

Expected: `syntax ok`

- [ ] **Step 5: Commit**

```bash
cd /home/vinw37/mdview
git add scripts/install.sh
git commit -m "feat: add install.sh to copy binary to ~/.local/bin"
```

---

## Task 3: Smoke test

- [ ] **Step 1: Run the full build and install**

```bash
cd /home/vinw37/mdview && npm run install:local
```

Expected: Tauri compiles (~1-2 min first time), Vite bundles, then:
```
mdview installed to /home/<user>/.local/bin/mdview
```

If `~/.local/bin` isn't on PATH, the warning message appears above the success line.

- [ ] **Step 2: Verify the binary exists and is executable**

```bash
ls -lh ~/.local/bin/mdview
```

Expected: a file with `x` permissions, around 10-30MB.

- [ ] **Step 3: Run the installed binary directly**

```bash
~/.local/bin/mdview &
sleep 3 && kill %1
```

Expected: app window opens (or process exits cleanly if no display is available in the current environment).

- [ ] **Step 4: If `~/.local/bin` is on PATH, verify the keyword works**

```bash
which mdview
```

Expected: `/home/<user>/.local/bin/mdview`

- [ ] **Step 5: Commit smoke test confirmation**

```bash
cd /home/vinw37/mdview
git commit --allow-empty -m "chore: verify install:local smoke test passes"
```

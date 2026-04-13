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

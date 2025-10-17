#!/bin/bash

# Permanent fix for Docker PATH issue on macOS
# This adds Docker to your PATH in your shell configuration

echo "🔧 Fixing Docker PATH..."

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_RC="$HOME/.profile"
    SHELL_NAME="shell"
fi

# Docker path
DOCKER_PATH="/Applications/Docker.app/Contents/Resources/bin"

# Check if already added
if grep -q "$DOCKER_PATH" "$SHELL_RC" 2>/dev/null; then
    echo "✓ Docker path already in $SHELL_RC"
else
    echo "Adding Docker to $SHELL_RC..."
    echo "" >> "$SHELL_RC"
    echo "# Docker Desktop CLI" >> "$SHELL_RC"
    echo "export PATH=\"$DOCKER_PATH:\$PATH\"" >> "$SHELL_RC"
    echo "✓ Added Docker to $SHELL_RC"
fi

# Also try to fix the broken symlink (requires sudo)
echo ""
echo "Attempting to fix Docker symlink (may require password)..."
if [ -L "/usr/local/bin/docker" ]; then
    sudo rm -f /usr/local/bin/docker
fi
sudo ln -sf "$DOCKER_PATH/docker" /usr/local/bin/docker 2>/dev/null && echo "✓ Symlink fixed" || echo "⚠ Could not create symlink (not critical)"

echo ""
echo "✅ Fix complete!"
echo ""
echo "To apply the changes:"
echo "  source $SHELL_RC"
echo ""
echo "Or restart your terminal."
echo ""
echo "Then you can run Docker commands from any directory!"


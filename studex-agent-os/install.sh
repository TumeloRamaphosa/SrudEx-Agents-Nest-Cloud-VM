#!/bin/bash

# StudEx Agent OS - Installation Script
# ======================================

echo "============================================"
echo "  StudEx Agent OS v1.0 - Installation"
echo "============================================"
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $PYTHON_VERSION"

# Install required packages
echo ""
echo "Installing Python packages..."
pip3 install flask requests psutil 2>/dev/null || pip install flask requests psutil 2>/dev/null

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Create directory structure
echo ""
echo "Creating directory structure..."
mkdir -p "$ROOT/memory/templates"
mkdir -p "$ROOT/agents"
mkdir -p "$ROOT/templates"

# Set permissions
echo ""
echo "Setting permissions..."
chmod +x "$ROOT"/agents/*.py 2>/dev/null || true
chmod +x "$ROOT/install.sh" "$ROOT/start.sh" "$ROOT/command_room.py"

# Verify installation
echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "Directory structure:"
tree "$ROOT" 2>/dev/null || find "$ROOT" -type f

echo ""
echo "To start the Agent OS:"
echo "  cd $ROOT"
echo "  ./start.sh"
echo ""
echo "Access dashboard:"
echo "  http://localhost:5000"
echo ""
echo "ADAM SMASHER is ready to coordinate!"
echo "============================================"

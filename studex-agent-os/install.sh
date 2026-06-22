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

# Create directory structure
echo ""
echo "Creating directory structure..."
mkdir -p /workspace/studex-agent-os/memory/templates
mkdir -p /workspace/studex-agent-os/agents
mkdir -p /workspace/studex-agent-os/templates

# Set permissions
echo ""
echo "Setting permissions..."
chmod +x /workspace/studex-agent-os/agents/*.py
chmod +x /workspace/studex-agent-os/install.sh

# Verify installation
echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "Directory structure:"
tree /workspace/studex-agent-os 2>/dev/null || find /workspace/studex-agent-os -type f

echo ""
echo "To start the Agent OS:"
echo "  cd /workspace/studex-agent-os"
echo "  python3 app.py"
echo ""
echo "Access dashboard:"
echo "  http://localhost:5000"
echo ""
echo "ADAM SMASHER is ready to coordinate!"
echo "============================================"

#!/bin/bash
# install.sh — Install StudEx Nest CLI to /usr/local/bin

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="/usr/local/bin"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}Installing StudEx Nest CLI...${NC}"
echo ""

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${YELLOW}Warning: Not running as root. Some symlinks may fail.${NC}"
    echo "Run with: sudo $0"
    echo ""
fi

# Create symlinks
echo -e "${GREEN}Creating symlinks...${NC}"

for script in nest nest-pull nest-logs nest-status nest-restart nest-market nest-pipeline nest-discord nest-today nest-help; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        chmod +x "$SCRIPT_DIR/$script"
        ln -sf "$SCRIPT_DIR/$script" "$INSTALL_DIR/$script"
        echo -e "  ${GREEN}✓${NC} $script"
    else
        echo -e "  ${RED}✗${NC} $script (not found)"
    fi
done

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Usage:"
echo "  nest help        # Show all commands"
echo "  nest status      # Check VM health"
echo "  nest pull        # Pull updates"
echo ""
echo -e "${BLUE}Happy managing, Tumelo!${NC}"

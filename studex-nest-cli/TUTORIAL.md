# Linux Bash Scripting Tutorial — StudEx Nest CLI

*For Tumelo Ramaphosa — Learning Linux for Agentic Business*

---

## What is Linux Bash Scripting?

**Bash** (Bourne Again Shell) is a command language interpreter for Linux. A **bash script** is a text file containing bash commands that run sequentially.

### Why it matters for VM management:

- **Automation**: Run complex tasks with one command
- **Speed**: No clicking through UIs
- **Reliability**: Same result every time
- **Scalability**: Manage multiple VMs easily

---

## Script-by-Script Breakdown

### 1. `nest` — Main Launcher

```bash
#!/bin/bash           # Shebang: tells Linux to use bash interpreter
# nest — description   # Comment explaining the script

CMD="${1:-help}"      # Get first argument, default to "help"
case "$CMD" in        # Switch statement for subcommands
    pull) exec ... ;; # Execute the subcommand script
    status) ... ;;
esac
```

**Key concepts:**
- `${1:-default}` — Use argument 1 or default value
- `case/esac` — Switch statement (like if/else but cleaner)
- `exec` — Replace current process with new script

---

### 2. `nest-pull` — Git Pull

```bash
# Check ~/nest exists
if [ ! -d "$HOME/nest" ]; then
    echo -e "${RED}Error: ~/nest not found${NC}"
    exit 1
fi

cd ~/nest || exit 1          # cd with OR exit on failure
git pull                      # Pull latest code
[ $? -eq 0 ] && echo "OK"     # Check exit code
```

**Key concepts:**
- `[ ! -d path ]` — Test if directory does NOT exist
- `$HOME` — User's home directory variable
- `|| exit 1` — OR exit with error code 1
- `$?` — Last command's exit code

---

### 3. `nest-status` — VM Health Check

```bash
pm2 list                      # List PM2 processes
docker ps                     # List Docker containers
df -h /                       # Disk usage (human readable)
free -h                       # Memory usage (human readable)

# Calculate usage percentage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
```

**Key concepts:**
- `$()` — Command substitution: capture output into variable
- `awk '{print $5}'` — Extract 5th column
- `sed 's/%//'` — Remove % character
- Conditional health assessment based on thresholds

---

### 4. `nest-logs` — Log Tailing

```bash
# Try PM2 first, then fallback to Docker
if command -v pm2 &> /dev/null; then
    pm2 logs --nostream --lines 50
fi

# Docker fallback
docker ps --format "{{.Names}}" | while read -r container; do
    docker logs --tail 20 "$container"
done
```

**Key concepts:**
- `command -v cmd` — Check if command exists
- `&> /dev/null` — Suppress output
- `while read` — Loop through lines
- `docker ps --format` — Format container output

---

### 5. `nest-market` — API Call

```bash
# Fetch USD/ZAR from API
USD_ZAR=$(curl -s "https://api.exchangerate-api.com/v4/latest/USD" | \
    grep -o '"ZAR":[0-9.]*' | cut -d: -f2)

# -s flag: silent (no progress)
# -m 5: timeout 5 seconds
```

**Key concepts:**
- `curl` — HTTP client for APIs
- `grep -o` — Extract matching pattern only
- `cut -d: -f2` — Get 2nd field by colon delimiter
- `\` — Line continuation

---

### 6. `nest-help` — Help Display

```bash
# Unicode box drawing
echo -e "${BLUE}╔════════════════════════════╗${NC}"
echo -e "${BLUE}║       StudEx Nest CLI      ║${NC}"
echo -e "${BLUE}╚════════════════════════════╝${NC}"
```

**Key concepts:**
- `echo -e` — Enable escape sequences (colors, etc.)
- `\033[0;32m` — ANSI color codes
- `${NC}` — No Color reset

---

### 7. `install.sh` — Installation Script

```bash
INSTALL_DIR="/usr/local/bin"
for script in nest nest-pull ...; do
    chmod +x "$SCRIPT_DIR/$script"   # Make executable
    ln -sf "$SCRIPT_DIR/$script" "$INSTALL_DIR/$script"  # Symlink
done
```

**Key concepts:**
- `chmod +x` — Make file executable
- `ln -sf` — Create symbolic link (force overwrite)
- `$SCRIPT_DIR` — Script's directory (calculated at runtime)

---

## Color Reference

| Code | Color |
|------|-------|
| `\033[0;32m` | Green |
| `\033[0;34m` | Blue |
| `\033[0;31m` | Red |
| `\033[1;33m` | Yellow (bold) |
| `\033[0m` | Reset (No Color) |

---

## Exercise for Tumelo

**Modify `nest-today` to also show CPU load average:**

Add these lines to the script:

```bash
echo ""
echo -e "${BLUE}=== System Load ===${NC}"
uptime | awk -F'load average:' '{print $2}'
```

Or check `/proc/loadavg`:
```bash
cat /proc/loadavg
```

**Challenge:** Create a new script `nest-cpu` that:
1. Shows CPU usage percentage
2. Shows top 5 processes by CPU
3. Returns CRITICAL if load > 4.0

---

## Next Week's Preview: Cron Jobs

**What you'll learn:**
- Scheduling tasks with cron
- `@reboot` — Run at startup
- `@daily` / `@hourly` — Automated tasks
- How to set up `nest-pull` to auto-update daily
- Monitoring with cron: `nest-status` emailed daily

**Example:**
```bash
# Edit crontab
crontab -e

# Add this line:
0 6 * * * /usr/local/bin/nest-pull >> /var/log/nest-pull.log 2>&1
```

This runs `nest-pull` every day at 6 AM SA time!

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `bash script.sh` | Run script |
| `./script.sh` | Run if executable |
| `chmod +x script.sh` | Make executable |
| `source script.sh` | Run in current shell |
| `export VAR=value` | Set environment variable |

---

## Useful Links

- Bash Guide: https://www.gnu.org/software/bash/manual/
- Advanced Bash-Scripting Guide
- Linux Man Pages: `man bash`

---

*Keep building, Tumelo! Each script you write makes ADAM smarter.*

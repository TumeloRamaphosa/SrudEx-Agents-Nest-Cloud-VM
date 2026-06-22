"""
StudEx Agent OS - Operations Agent
Monitors VM health (PM2, Docker, disk, RAM)
Runs nest-cli commands, stores uptime history
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Paths
UPTIME_FILE = "/workspace/studex-agent-os/memory/uptime.json"

def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [OPS] {msg}")

def run_command(cmd, shell=False):
    """Run a shell command safely"""
    try:
        if shell:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        else:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def check_pm2():
    """Check PM2 process manager status"""
    log("Checking PM2 status...")
    result = run_command("pm2 list", shell=True)
    
    if result["success"]:
        return {"status": "running", "details": result["stdout"]}
    return {"status": "not_running", "details": None}

def check_docker():
    """Check Docker status"""
    log("Checking Docker status...")
    result = run_command(["docker", "ps"])
    
    if result["success"]:
        return {"status": "running", "containers": len(result["stdout"].split('\n')) - 1}
    return {"status": "not_running", "error": result.get("error", "Docker not available")}

def check_disk():
    """Check disk usage"""
    log("Checking disk usage...")
    result = run_command(["df", "-h", "/"])
    
    if result["success"]:
        lines = result["stdout"].split('\n')
        if len(lines) > 1:
            parts = lines[1].split()
            return {
                "total": parts[1],
                "used": parts[2],
                "available": parts[3],
                "percent": parts[4]
            }
    return {"error": "Could not read disk"}

def check_ram():
    """Check RAM usage"""
    try:
        import psutil
        mem = psutil.virtual_memory()
        return {
            "total": f"{mem.total / (1024**3):.1f} GB",
            "used": f"{mem.used / (1024**3):.1f} GB",
            "percent": mem.percent
        }
    except ImportError:
        result = run_command(["free", "-h"])
        return {"raw": result.get("stdout", "N/A")}

def check_uptime():
    """Get system uptime"""
    result = run_command(["uptime", "-p"])
    if result["success"]:
        return result["stdout"]
    return "Unknown"

def run_nest_command(command):
    """
    Run nest-cli commands
    Common: nest build, nest start, nest generate
    """
    log(f"Running nest command: {command}")
    result = run_command(f"cd /workspace/studex-agent-os && npx nest {command}", shell=True)
    return result

def save_uptime_history(data):
    """Save uptime history to file"""
    os.makedirs(os.path.dirname(UPTIME_FILE), exist_ok=True)
    with open(UPTIME_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def load_uptime_history():
    """Load uptime history"""
    if os.path.exists(UPTIME_FILE):
        with open(UPTIME_FILE, 'r') as f:
            return json.load(f)
    return {"history": []}

def update_uptime_record():
    """Update uptime record with current health data"""
    history = load_uptime_history()
    
    record = {
        "timestamp": datetime.now().isoformat(),
        "pm2": check_pm2(),
        "docker": check_docker(),
        "disk": check_disk(),
        "ram": check_ram(),
        "uptime": check_uptime()
    }
    
    history["history"].append(record)
    # Keep last 100 records
    history["history"] = history["history"][-100:]
    history["last_check"] = record["timestamp"]
    
    save_uptime_history(history)
    return record

class OpsAgent:
    """Operations Agent class"""
    
    def __init__(self):
        self.name = "Ops"
        self.status = "active"
        log("Ops Agent initialized")
    
    def run(self, task):
        """Execute operations task"""
        log(f"Executing task: {task}")
        
        task_lower = task.lower()
        
        if "health" in task_lower or "status" in task_lower:
            return update_uptime_record()
        elif "pm2" in task_lower:
            return check_pm2()
        elif "docker" in task_lower:
            return check_docker()
        elif "disk" in task_lower:
            return check_disk()
        elif "ram" in task_lower:
            return check_ram()
        elif "nest" in task_lower:
            # Extract nest command
            cmd = task_lower.replace("nest", "").strip()
            return run_nest_command(cmd)
        else:
            return update_uptime_record()

if __name__ == "__main__":
    # Test the agent
    agent = OpsAgent()
    
    # Test health check
    result = agent.run("health check")
    print(json.dumps(result, indent=2))

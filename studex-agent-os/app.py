"""
StudEx Agent OS - Web Console & API Server
Port 5000 | ADAM SMASHER Dashboard
"""

import json
import os
import time
from datetime import datetime
from flask import Flask, render_template, jsonify, request
import psutil

app = Flask(__name__)

# Base path
BASE_PATH = "/workspace/studex-agent-os"
MEMORY_PATH = f"{BASE_PATH}/memory"

# Agent state storage
AGENTS = {
    "research": {"name": "Research", "status": "green", "last_task": None, "uptime": time.time()},
    "markets": {"name": "Markets", "status": "green", "last_task": None, "uptime": time.time()},
    "ops": {"name": "Ops", "status": "green", "last_task": None, "uptime": time.time()},
    "comms": {"name": "Comms", "status": "green", "last_task": None, "uptime": time.time()},
    "deals": {"name": "Deals", "status": "green", "last_task": None, "uptime": time.time()},
}

# Task history per agent
TASK_HISTORY = {agent: [] for agent in AGENTS}

# Pipeline data
PIPELINE = {
    "deals": [
        {"id": 1, "name": "Uvelka Wheat Deal", "value": 450000, "stage": "Negotiation", "probability": 75},
        {"id": 2, "name": "NTechLab Kenya", "value": 1200000, "stage": "Discovery", "probability": 40},
        {"id": 3, "name": "SA Grain Futures", "value": 890000, "stage": "Due Diligence", "probability": 60},
        {"id": 4, "name": "PharmaSyntez Distribution", "value": 340000, "stage": "Contract", "probability": 85},
    ],
    "total_value": 2880000
}

def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")

def get_vm_metrics():
    """Get VM CPU, RAM, Disk usage"""
    return {
        "cpu": psutil.cpu_percent(interval=0.1),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent
    }

def get_market_data():
    """Get cached market data or defaults"""
    market_file = f"{MEMORY_PATH}/market-data.json"
    defaults = {
        "usdzar": 18.75,
        "brent": 82.50,
        "gold": 2340.00
    }
    if os.path.exists(market_file):
        try:
            with open(market_file) as f:
                data = json.load(f)
                return data.get("prices", defaults)
        except:
            pass
    return defaults

@app.route("/")
def dashboard():
    """Main dashboard page"""
    log("ADAM SMASHER: Dashboard accessed")
    return render_template("dashboard.html")

@app.route("/api/status")
def api_status():
    """System-wide status endpoint"""
    vm = get_vm_metrics()
    market = get_market_data()
    
    # Calculate total pipeline value
    total_value = sum(d["value"] * d["probability"] / 100 for d in PIPELINE["deals"])
    
    response = {
        "agents": [
            {
                "name": info["name"],
                "status": info["status"],
                "last_task": info["last_task"],
                "uptime": round(time.time() - info["uptime"], 0)
            }
            for agent, info in AGENTS.items()
        ],
        "vm": vm,
        "pipeline": {
            "deals": len(PIPELINE["deals"]),
            "total_value": PIPELINE["total_value"]
        },
        "market": market
    }
    log("ADAM SMASHER: Status request served")
    return jsonify(response)

@app.route("/api/agent/<name>/task", methods=["POST"])
def agent_task(name):
    """Submit task to a specific agent"""
    if name not in AGENTS:
        return jsonify({"error": "Agent not found"}), 404
    
    data = request.get_json() or {}
    task = data.get("task", "No task specified")
    
    # Update agent state
    AGENTS[name]["last_task"] = task
    AGENTS[name]["status"] = "active"
    
    # Add to history
    TASK_HISTORY[name].append({
        "task": task,
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    })
    
    log(f"ADAM SMASHER: Task assigned to {name}: {task}")
    
    return jsonify({
        "status": "accepted",
        "agent": AGENTS[name]["name"],
        "task": task
    })

@app.route("/api/agent/<name>/history", methods=["GET"])
def agent_history(name):
    """Get task history for an agent"""
    if name not in TASK_HISTORY:
        return jsonify({"error": "Agent not found"}), 404
    
    return jsonify({
        "agent": name,
        "history": TASK_HISTORY[name][-20:]  # Last 20 tasks
    })

@app.route("/api/pipeline", methods=["GET"])
def get_pipeline():
    """Get deal pipeline data"""
    return jsonify(PIPELINE)

@app.route("/health")
def health():
    """Health check endpoint"""
    return "OK"

if __name__ == "__main__":
    log("=" * 60)
    log("StudEx Agent OS v1.0 - ADAM SMASHER")
    log("=" * 60)
    log("Starting on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)

"""
StudEx Agent OS - Web Console & API Server
Port 5000 | ADAM SMASHER Dashboard
"""

import json
import os
import time
from datetime import datetime
from flask import Flask, Response, render_template, jsonify, request
import psutil

from grok import GrokClient
from orchestrator import Orchestrator

app = Flask(__name__)

# Base path: defaults to this checkout so the console runs anywhere, overridable
# with STUDEX_BASE_PATH on the VM (historically /workspace/studex-agent-os).
BASE_PATH = os.environ.get("STUDEX_BASE_PATH") or os.path.dirname(os.path.abspath(__file__))
MEMORY_PATH = f"{BASE_PATH}/memory"

MEMORY_FILES = {
    "research": "research.md",
    "markets": "market-data.json",
    "ops": "uptime.json",
    "comms": "comms.md",
    "deals": "pipeline.json",
}

MAX_CHAT_MESSAGES = 40

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
    """Get VM CPU, RAM, Disk usage and how long the box has been up"""
    return {
        "cpu": psutil.cpu_percent(interval=0.1),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "uptime": round(time.time() - psutil.boot_time())
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

def build_status():
    """System-wide status snapshot, shared by /api/status and the Grok tools"""
    vm = get_vm_metrics()
    market = get_market_data()

    # Probability-weighted pipeline value
    weighted_value = sum(d["value"] * d["probability"] / 100 for d in PIPELINE["deals"])

    return {
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
            "total_value": PIPELINE["total_value"],
            "weighted_value": round(weighted_value, 2)
        },
        "market": market
    }

@app.route("/api/status")
def api_status():
    """System-wide status endpoint"""
    response = build_status()
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

def tool_get_status():
    """Tool: full system snapshot (same shape as /api/status)."""
    return build_status()


def tool_get_pipeline():
    """Tool: deal pipeline."""
    return PIPELINE


def tool_get_agent_history(agent, limit=10):
    """Tool: recent tasks for one agent."""
    if agent not in TASK_HISTORY:
        return {"error": f"Unknown agent '{agent}'. Known: {sorted(AGENTS)}"}
    limit = max(1, min(int(limit), 50))
    return {"agent": agent, "history": TASK_HISTORY[agent][-limit:]}


def tool_read_agent_memory(agent):
    """Tool: read an agent's persistent memory file."""
    filename = MEMORY_FILES.get(agent)
    if filename is None:
        return {"error": f"Unknown agent '{agent}'. Known: {sorted(MEMORY_FILES)}"}
    path = os.path.join(MEMORY_PATH, filename)
    if not os.path.exists(path):
        return {"agent": agent, "path": path, "content": None, "note": "No memory written yet"}
    with open(path) as handle:
        return {"agent": agent, "path": path, "content": handle.read()[:20000]}


def tool_assign_task(agent, task):
    """Tool: dispatch a task to an agent (same path as /api/agent/<name>/task)."""
    if agent not in AGENTS:
        return {"error": f"Unknown agent '{agent}'. Known: {sorted(AGENTS)}"}
    task = str(task).strip()
    if not task:
        return {"error": "Task must not be empty"}
    AGENTS[agent]["last_task"] = task
    AGENTS[agent]["status"] = "active"
    TASK_HISTORY[agent].append(
        {"task": task, "timestamp": datetime.now().isoformat(), "status": "queued", "via": "grok"}
    )
    log(f"ADAM SMASHER: Grok assigned task to {agent}: {task}")
    return {"status": "queued", "agent": agent, "task": task}


ORCHESTRATOR_TOOLS = {
    "get_status": tool_get_status,
    "get_pipeline": tool_get_pipeline,
    "get_agent_history": tool_get_agent_history,
    "read_agent_memory": tool_read_agent_memory,
    "assign_task": tool_assign_task,
}


def sse(event):
    """Encode one orchestrator event as a server-sent event."""
    return f"data: {json.dumps(event, default=str)}\n\n"


@app.route("/api/chat", methods=["POST"])
def chat():
    """Grok-powered ADAM SMASHER chat, streamed as SSE with a tool-call trace."""
    data = request.get_json(silent=True) or {}
    messages = data.get("messages")
    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "Body must include a non-empty 'messages' array"}), 400

    history = []
    for message in messages[-MAX_CHAT_MESSAGES:]:
        if not isinstance(message, dict):
            return jsonify({"error": "Each message must be an object"}), 400
        role = message.get("role")
        content = message.get("content")
        if role not in ("user", "assistant") or not isinstance(content, str) or not content.strip():
            return jsonify({"error": "Each message needs role user|assistant and text content"}), 400
        history.append({"role": role, "content": content[:20000]})

    client = GrokClient()
    if not client.configured:
        return (
            jsonify(
                {
                    "error": "Grok is not configured",
                    "detail": "Set XAI_API_KEY in the VM environment (key from https://console.x.ai).",
                }
            ),
            503,
        )

    orchestrator = Orchestrator(ORCHESTRATOR_TOOLS, client=client)
    live_search = bool(data.get("live_search", True))
    log(f"ADAM SMASHER: chat turn ({len(history)} messages, model={client.model})")

    def generate():
        for event in orchestrator.chat(history, live_search=live_search):
            yield sse(event)

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.route("/api/chat/config")
def chat_config():
    """Whether Grok is wired up, and which model the console will use."""
    client = GrokClient()
    return jsonify({"configured": client.configured, "model": client.model})


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

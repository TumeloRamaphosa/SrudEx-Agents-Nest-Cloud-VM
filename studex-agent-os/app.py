"""
StudEx Agent OS - Web Console & API Server
Port 5000 | ADAM SMASHER Dashboard
"""

import json
import os
import time
import uuid
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, jsonify, request, Response
import psutil
import requests

from agents.finance import FinanceAgent

app = Flask(__name__)

@app.after_request
def after_request(response):
    """Add CORS headers so the API can be used from other local demos (e.g. Hermes WebUI)."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Base path
BASE_DIR = Path(__file__).resolve().parent
MEMORY_PATH = BASE_DIR / "memory"

# Agent state storage
AGENTS = {
    "research": {"name": "Research", "status": "green", "last_task": None, "uptime": time.time()},
    "markets": {"name": "Markets", "status": "green", "last_task": None, "uptime": time.time()},
    "ops": {"name": "Ops", "status": "green", "last_task": None, "uptime": time.time()},
    "comms": {"name": "Comms", "status": "green", "last_task": None, "uptime": time.time()},
    "deals": {"name": "Deals", "status": "green", "last_task": None, "uptime": time.time()},
    "finance": {"name": "Finance", "status": "green", "last_task": None, "uptime": time.time()},
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
    market_file = MEMORY_PATH / "market-data.json"
    defaults = {
        "usdzar": 18.75,
        "brent": 82.50,
        "gold": 2340.00
    }
    if market_file.exists():
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
    
    # Execute the task if a runner is available; finance is wired live
    result = None
    if name == "finance":
        try:
            result = FinanceAgent().run(task)
        except Exception as e:
            return jsonify({"error": f"Finance agent failed: {str(e)}"}), 500
    
    # Add to history
    TASK_HISTORY[name].append({
        "task": task,
        "timestamp": datetime.now().isoformat(),
        "status": "completed",
        "result": result
    })
    
    log(f"ADAM SMASHER: Task assigned to {name}: {task}")
    
    response = {
        "status": "accepted",
        "agent": AGENTS[name]["name"],
        "task": task
    }
    if result is not None:
        response["result"] = result
    
    return jsonify(response)

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


# ── OpenAI-compatible chat endpoints (used by external UI clients like Hermes WebUI) ──

def _openai_chat_id():
    return f"chatcmpl-{uuid.uuid4().hex[:12]}"


def _last_user_message(messages):
    """Extract the last user message from an OpenAI-style messages list."""
    for msg in reversed(messages or []):
        if msg.get("role") == "user":
            return msg.get("content") or ""
    return "pnl summary"


def _format_finance_result(result):
    """Turn a FinanceAgent result dict into a friendly Markdown string."""
    if isinstance(result, dict) and "error" in result:
        return f"Sorry, I couldn't process that: {result['error']}"
    return json.dumps(result, indent=2, ensure_ascii=False)


@app.route("/v1/models", methods=["GET", "OPTIONS"])
def openai_models():
    """Expose finance-agent, configured remote providers, and any reachable local server."""
    models = [_model_entry("finance-agent", "studex-agent-os")]

    if GROK_API_KEY:
        models.extend([
            _model_entry("grok-2-latest", "xai"),
            _model_entry("grok-2-vision-latest", "xai"),
            _model_entry("grok-3-mini", "xai"),
        ])
    if QUINN_BASE_URL and QUINN_API_KEY:
        models.append(_model_entry("quinn/default", "quinn"))
    if LOCAL_LLAMA_BASE_URL:
        try:
            local_models = _discover_local_models()
            models.extend(local_models or [_model_entry("local/<model>", "local-llama")])
        except Exception:
            models.append(_model_entry("local/<model>", "local-llama"))

    return jsonify({"object": "list", "data": models})


@app.route("/v1/chat/completions", methods=["POST", "OPTIONS"])
def openai_chat_completions():
    """Route OpenAI-compatible chat requests to finance agent, Grok, Quinn, or local llama."""
    body = request.get_json(force=True, silent=True) or {}
    model = body.get("model", "finance-agent")
    base_url, api_key, effective_model, is_local = _resolve_provider(model)

    if not is_local:
        body["model"] = effective_model
        return _proxy_chat(base_url, api_key, body)

    messages = body.get("messages", [])
    task = _last_user_message(messages)
    stream = bool(body.get("stream", False))

    try:
        result = FinanceAgent().run(task)
        content = _format_finance_result(result)
    except Exception as exc:
        content = f"Finance agent failed: {str(exc)}"

    if stream:
        def generate():
            chat_id = _openai_chat_id()
            created = int(time.time())
            # First chunk with assistant role
            chunk = {
                "id": chat_id,
                "object": "chat.completion.chunk",
                "created": created,
                "model": model,
                "choices": [
                    {
                        "index": 0,
                        "delta": {"role": "assistant", "content": ""},
                        "finish_reason": None,
                    }
                ],
            }
            yield f"data: {json.dumps(chunk)}\n\n"
            # Content chunk
            chunk["choices"][0]["delta"] = {"content": content}
            yield f"data: {json.dumps(chunk)}\n\n"
            # End marker
            chunk["choices"][0]["delta"] = {}
            chunk["choices"][0]["finish_reason"] = "stop"
            yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    return jsonify({
        "id": _openai_chat_id(),
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    })


# ── Multi-provider routing for Grok, Quinn, and local llama-server ──

# Provider config (keys are NOT committed; use .env or env vars)
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_BASE_URL = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1").rstrip("/")

QUINN_API_KEY = os.getenv("QUINN_API_KEY", "")
QUINN_BASE_URL = os.getenv("QUINN_BASE_URL", "").rstrip("/")

LOCAL_LLAMA_API_KEY = os.getenv("LOCAL_LLAMA_API_KEY", "")
LOCAL_LLAMA_BASE_URL = os.getenv("LOCAL_LLAMA_BASE_URL", "http://localhost:9090/v1").rstrip("/")


def _resolve_provider(model):
    """Return (base_url, api_key, effective_model, is_local) for a model name."""
    model = (model or "").strip()
    if not model or model == "finance-agent" or model.startswith("studex-"):
        return None, None, model, True

    if model.startswith("xai/"):
        model = model[4:]
    if model.startswith("grok-"):
        return GROK_BASE_URL, GROK_API_KEY, model, False

    if model.startswith("quinn/"):
        return QUINN_BASE_URL, QUINN_API_KEY, model[6:], False
    if model.startswith("qwen/"):
        return QUINN_BASE_URL, QUINN_API_KEY, model[5:], False

    if model.startswith("local/") or model.startswith("llama/"):
        return LOCAL_LLAMA_BASE_URL, LOCAL_LLAMA_API_KEY, model.split("/", 1)[1], False

    # Default: treat unknown models as local finance tasks (backward compat)
    return None, None, model, True


def _auth_header():
    """Return a non-dummy Authorization header from the request, if any."""
    auth = request.headers.get("Authorization", "")
    if auth and auth.lower().startswith("bearer "):
        token = auth[7:].strip()
        if token and token.lower() != "dummy":
            return auth
    return None


def _proxy_chat(base_url, api_key, body):
    """Forward an OpenAI chat request to base_url and return Flask response."""
    if not base_url:
        raise ValueError("Provider base URL is not configured")

    headers = {"Content-Type": "application/json"}
    # Prefer configured key, then request header, never a dummy token.
    key = (api_key or "").strip()
    if not key:
        auth = _auth_header()
        if auth:
            key = auth[7:].strip()
    if key:
        headers["Authorization"] = f"Bearer {key}"

    url = f"{base_url}/chat/completions"
    stream = bool(body.get("stream"))

    try:
        resp = requests.post(url, json=body, headers=headers, stream=stream, timeout=120)
    except Exception as exc:
        return jsonify({"error": f"Provider unreachable: {exc}"}), 502

    if not stream:
        try:
            data = resp.json()
        except Exception:
            data = {"error": resp.text[:500]}
        return jsonify(data), resp.status_code

    def generate():
        for chunk in resp.iter_content(chunk_size=1024):
            if chunk:
                yield chunk

    return Response(
        generate(),
        status=resp.status_code,
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


def _discover_local_models():
    """Fetch /v1/models from the configured local llama-server, if reachable."""
    base = LOCAL_LLAMA_BASE_URL
    if not base:
        return []
    try:
        headers = {}
        key = (LOCAL_LLAMA_API_KEY or "").strip()
        if key:
            headers["Authorization"] = f"Bearer {key}"
        r = requests.get(f"{base}/models", headers=headers, timeout=3)
        if r.status_code == 200:
            data = r.json()
            models = data.get("data", []) if isinstance(data, dict) else data
            for m in models:
                m["owned_by"] = m.get("owned_by", "local-llama")
            return models
    except Exception:
        pass
    return []


def _model_entry(model_id, owned_by="studex-agent-os"):
    return {
        "id": model_id,
        "object": "model",
        "created": int(time.time()),
        "owned_by": owned_by,
    }


if __name__ == "__main__":
    log("=" * 60)
    log("StudEx Agent OS v1.0 - ADAM SMASHER")
    log("=" * 60)
    log("Starting on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)

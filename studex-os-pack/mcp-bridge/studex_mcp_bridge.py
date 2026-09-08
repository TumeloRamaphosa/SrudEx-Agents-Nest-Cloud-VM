#!/usr/bin/env python3
"""
STUDEX MCP BRIDGE
=================
Standard MCP (Model Context Protocol) server that gives any MCP-speaking agent
(Claude, OpenClaw, Cursor, GPT, fleet agents) read/write access to the shared
Studex OS folder — the pack you downloaded/unzipped.

Run:  python3 studex_mcp_bridge.py
Env:  STUDEX_BRIDGE_ROOT  (default: parent dir of this script)

Protocol: newline-delimited JSON-RPC 2.0 over stdio (MCP stdio transport).
Tools:
  studex_list_files, studex_read_file, studex_write_file, studex_search,
  studex_get_status, studex_leave_message, studex_read_inbox
"""
import json
import os
import sys
import datetime

BRIDGE_ROOT = os.path.realpath(os.environ.get(
    "STUDEX_BRIDGE_ROOT",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
))
BRIDGE_DIR = os.path.join(BRIDGE_ROOT, "bridge")
INBOX = os.path.join(BRIDGE_DIR, "inbox")

TOOLS = [
    {
        "name": "studex_list_files",
        "description": "List files and folders in the Studex OS shared pack. "
                       "Pass path='' for the root.",
        "inputSchema": {"type": "object", "properties": {
            "path": {"type": "string", "description": "Relative path inside the pack"}}}
    },
    {
        "name": "studex_read_file",
        "description": "Read a file from the Studex OS pack (max 100KB).",
        "inputSchema": {"type": "object", "required": ["path"], "properties": {
            "path": {"type": "string"}}}
    },
    {
        "name": "studex_write_file",
        "description": "Write/create a file inside the Studex OS pack. Use results/<your-name>/ "
                       "for outputs and bridge/inbox/ for messages to Katjana.",
        "inputSchema": {"type": "object", "required": ["path", "content"], "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"}}}
    },
    {
        "name": "studex_search",
        "description": "Grep the Studex OS pack for a keyword/phrase. Returns first 50 matches.",
        "inputSchema": {"type": "object", "required": ["query"], "properties": {
            "query": {"type": "string"},
            "path": {"type": "string"}}}
    },
    {
        "name": "studex_get_status",
        "description": "Get the current Studex OS status brief (bridge/STATUS.md).",
        "inputSchema": {"type": "object", "properties": {}}
    },
    {
        "name": "studex_leave_message",
        "description": "Leave a message for Katjana (Head of Customer Sales, base orchestrator) "
                       "or the fleet in the bridge inbox.",
        "inputSchema": {"type": "object", "required": ["from_name", "message"], "properties": {
            "from_name": {"type": "string"},
            "message": {"type": "string"}}}
    },
    {
        "name": "studex_read_inbox",
        "description": "Read all messages in the bridge inbox (fleet chatter).",
        "inputSchema": {"type": "object", "properties": {}}
    },
    {
        "name": "studex_command_room",
        "description": "Probe the Mac command room: OpenMausBot, Hermes ACP, Ollama, and coding CLIs.",
        "inputSchema": {"type": "object", "properties": {}}
    },
]


def safe_path(rel):
    rel = (rel or "").strip().lstrip("/")
    full = os.path.realpath(os.path.join(BRIDGE_ROOT, rel))
    if not full.startswith(BRIDGE_ROOT + os.sep) and full != BRIDGE_ROOT:
        raise ValueError("Path escapes the Studex OS pack: %s" % rel)
    return full


def list_files(args):
    base = safe_path(args.get("path", ""))
    out = []
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
        rel_root = os.path.relpath(root, BRIDGE_ROOT)
        for d in dirs:
            out.append(rel_root + "/" + d + "/")
        for f in files:
            p = os.path.join(rel_root, f) if rel_root != "." else f
            out.append(p)
        if len(out) > 400:
            out.append("... (truncated at 400 entries)")
            break
    return "\n".join(out) or "(empty)"


def read_file(args):
    full = safe_path(args["path"])
    with open(full, "r", encoding="utf-8", errors="replace") as fh:
        data = fh.read(100 * 1024)
    return data


def write_file(args):
    full = safe_path(args["path"])
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as fh:
        fh.write(args["content"])
    return "Wrote %d bytes to %s" % (len(args["content"]), args["path"])


def search(args):
    query = args["query"].lower()
    base = safe_path(args.get("path", ""))
    matches = []
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
        for f in files:
            full = os.path.join(root, f)
            if os.path.getsize(full) > 2 * 1024 * 1024:
                continue
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    for i, line in enumerate(fh, 1):
                        if query in line.lower():
                            rel = os.path.relpath(full, BRIDGE_ROOT)
                            matches.append("%s:%d: %s" % (rel, i, line.strip()[:160]))
                            if len(matches) >= 50:
                                return "\n".join(matches)
            except OSError:
                continue
    return "\n".join(matches) or "(no matches)"


def get_status(args):
    status = os.path.join(BRIDGE_DIR, "STATUS.md")
    if os.path.exists(status):
        with open(status, "r", encoding="utf-8") as fh:
            return fh.read()
    return "No STATUS.md found. Bridge root: %s" % BRIDGE_ROOT


def leave_message(args):
    os.makedirs(INBOX, exist_ok=True)
    today = datetime.date.today().isoformat()
    fname = "%s-%s.md" % (today, "".join(c if c.isalnum() else "_" for c in args["from_name"])[:30])
    path = os.path.join(INBOX, fname)
    stamp = datetime.datetime.now().isoformat(timespec="seconds")
    with open(path, "a", encoding="utf-8") as fh:
        fh.write("\n\n---\n**From:** %s\n**At:** %s\n\n%s\n" % (args["from_name"], stamp, args["message"]))
    return "Message logged to bridge inbox (%s). Katjana reads the inbox on every wake-up." % fname


def command_room(args):
    nest = os.path.join(os.path.expanduser("~"), "The-Nexus-Agents-NEst", "studex-agent-os", "command_room.py")
    if not os.path.isfile(nest):
        return "command_room.py not found at %s" % nest
    import subprocess
    try:
        out = subprocess.check_output(["python3", nest], timeout=8, text=True)
    except Exception as exc:
        return "probe failed: %s" % exc
    return out


def read_inbox(args):
    if not os.path.isdir(INBOX):
        return "(inbox empty)"
    parts = []
    for f in sorted(os.listdir(INBOX)):
        if not f.endswith(".md"):
            continue
        with open(os.path.join(INBOX, f), "r", encoding="utf-8", errors="replace") as fh:
            parts.append("=== %s ===\n%s" % (f, fh.read()))
    return "\n\n".join(parts) or "(inbox empty)"


DISPATCH = {name: fn for name, fn in [
    ("studex_list_files", list_files), ("studex_read_file", read_file),
    ("studex_write_file", write_file), ("studex_search", search),
    ("studex_get_status", get_status), ("studex_leave_message", leave_message),
    ("studex_read_inbox", read_inbox), ("studex_command_room", command_room),
]}


def handle(msg):
    method = msg.get("method", "")
    msg_id = msg.get("id")
    if method == "initialize":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "studex-mcp-bridge", "version": "1.0.0"}}}
    if method in ("notifications/initialized", "notifications/cancelled"):
        return None
    if method == "ping":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {}}
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {"tools": TOOLS}}
    if method == "tools/call":
        params = msg.get("params", {})
        name = params.get("name")
        args = params.get("arguments", {}) or {}
        fn = DISPATCH.get(name)
        if not fn:
            return {"jsonrpc": "2.0", "id": msg_id, "result": {
                "content": [{"type": "text", "text": "Unknown tool: %s" % name}], "isError": True}}
        try:
            return {"jsonrpc": "2.0", "id": msg_id, "result": {
                "content": [{"type": "text", "text": fn(args)}]}}
        except Exception as exc:
            return {"jsonrpc": "2.0", "id": msg_id, "result": {
                "content": [{"type": "text", "text": "Error: %s" % exc}], "isError": True}}
    if msg_id is not None:
        return {"jsonrpc": "2.0", "id": msg_id,
                "error": {"code": -32601, "message": "Method not found: %s" % method}}
    return None


def main():
    os.makedirs(INBOX, exist_ok=True)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        resp = handle(msg)
        if resp is not None:
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()

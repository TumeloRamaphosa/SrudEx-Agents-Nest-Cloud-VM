"""
StudEx Agent OS - Communications Agent
Drafts emails, Discord messages, Lark messages
Stores templates in memory/templates/
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Paths
TEMPLATES_DIR = "/workspace/studex-agent-os/memory/templates"

def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [COMMS] {msg}")

def load_template(name):
    """Load a message template"""
    template_path = os.path.join(TEMPLATES_DIR, f"{name}.md")
    
    if os.path.exists(template_path):
        with open(template_path, 'r') as f:
            return f.read()
    return None

def save_template(name, content):
    """Save a message template"""
    os.makedirs(TEMPLATES_DIR, exist_ok=True)
    template_path = os.path.join(TEMPLATES_DIR, f"{name}.md")
    
    with open(template_path, 'w') as f:
        f.write(content)
    log(f"Template saved: {name}")

def list_templates():
    """List all available templates"""
    os.makedirs(TEMPLATES_DIR, exist_ok=True)
    templates = []
    
    for f in os.listdir(TEMPLATES_DIR):
        if f.endswith('.md'):
            templates.append(f.replace('.md', ''))
    
    return templates

def render_template(template_name, variables=None):
    """Render a template with variables"""
    template = load_template(template_name)
    
    if not template:
        return {"error": f"Template '{template_name}' not found"}
    
    # Simple variable replacement
    if variables:
        for key, value in variables.items():
            template = template.replace(f"{{{{{key}}}}}", str(value))
    
    return {"template": template_name, "rendered": template}

def draft_email(recipient, subject, body, template=None):
    """
    Draft an email
    In production: integrate with email service (SendGrid, etc.)
    """
    log(f"Drafting email to: {recipient}")
    
    email = {
        "type": "email",
        "recipient": recipient,
        "subject": subject,
        "body": body,
        "timestamp": datetime.now().isoformat()
    }
    
    if template:
        email["template_used"] = template
    
    return email

def draft_discord_message(channel, content):
    """
    Draft a Discord message
    In production: integrate with Discord API
    """
    log(f"Drafting Discord message for: {channel}")
    
    message = {
        "type": "discord",
        "channel": channel,
        "content": content,
        "timestamp": datetime.now().isoformat()
    }
    
    return message

def draft_lark_message(recipient, content):
    """
    Draft a Lark (Feishu) message
    In production: integrate with Lark API
    """
    log(f"Drafting Lark message for: {recipient}")
    
    message = {
        "type": "lark",
        "recipient": recipient,
        "content": content,
        "timestamp": datetime.now().isoformat()
    }
    
    return message

def generate_morning_brief():
    """Generate morning brief using template"""
    log("Generating morning brief...")
    
    template = load_template("morning-brief")
    if not template:
        return draft_email(
            "team@studex.com",
            "Morning Brief - " + datetime.now().strftime("%Y-%m-%d"),
            "Daily briefing content..."
        )
    
    # Render with today's date
    return render_template("morning-brief", {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "day": datetime.now().strftime("%A")
    })

def generate_evening_summary():
    """Generate evening summary using template"""
    log("Generating evening summary...")
    
    template = load_template("evening-summary")
    if not template:
        return draft_email(
            "team@studex.com",
            "Evening Summary - " + datetime.now().strftime("%Y-%m-%d"),
            "Daily summary content..."
        )
    
    return render_template("evening-summary", {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M")
    })

class CommsAgent:
    """Communications Agent class"""
    
    def __init__(self):
        self.name = "Comms"
        self.status = "active"
        self.sent_messages = []
        log("Comms Agent initialized")
    
    def run(self, task):
        """Execute communications task"""
        log(f"Executing task: {task}")
        
        task_lower = task.lower()
        
        if "template" in task_lower:
            if "list" in task_lower:
                return {"templates": list_templates()}
            elif "render" in task_lower:
                # Extract template name
                parts = task_lower.split()
                if len(parts) > 1:
                    return render_template(parts[-1])
        elif "email" in task_lower:
            return draft_email(
                "recipient@example.com",
                "Subject",
                "Email body..."
            )
        elif "discord" in task_lower:
            return draft_discord_message(
                "general",
                "Discord message..."
            )
        elif "lark" in task_lower:
            return draft_lark_message(
                "user@example.com",
                "Lark message..."
            )
        elif "morning" in task_lower or "brief" in task_lower:
            return generate_morning_brief()
        elif "evening" in task_lower or "summary" in task_lower:
            return generate_evening_summary()
        else:
            return {"status": "unknown_task", "task": task}

if __name__ == "__main__":
    # Test the agent
    agent = CommsAgent()
    
    # Test template list
    result = agent.run("list templates")
    print(json.dumps(result, indent=2))
    
    # Test morning brief
    result = agent.run("morning brief")
    print(json.dumps(result, indent=2))

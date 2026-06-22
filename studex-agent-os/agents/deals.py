"""
StudEx Agent OS - Deals Agent
Tracks pipeline, sends Uvelka updates, manages MEATSA contacts
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Paths
PIPELINE_FILE = "/workspace/studex-agent-os/memory/pipeline.json"
CONTACTS_FILE = "/workspace/studex-agent-os/memory/contacts.json"

def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [DEALS] {msg}")

def load_pipeline():
    """Load deal pipeline"""
    if os.path.exists(PIPELINE_FILE):
        with open(PIPELINE_FILE, 'r') as f:
            return json.load(f)
    
    # Default pipeline
    return {
        "deals": [
            {
                "id": 1,
                "name": "Uvelka Wheat Deal",
                "value": 450000,
                "stage": "Negotiation",
                "probability": 75,
                "contacts": ["uvelka@wheat.com"],
                "last_update": datetime.now().isoformat()
            },
            {
                "id": 2,
                "name": "NTechLab Kenya",
                "value": 1200000,
                "stage": "Discovery",
                "probability": 40,
                "contacts": ["info@nitechlab.co.ke"],
                "last_update": datetime.now().isoformat()
            },
            {
                "id": 3,
                "name": "SA Grain Futures",
                "value": 890000,
                "stage": "Due Diligence",
                "probability": 60,
                "contacts": ["trading@sagrains.co.za"],
                "last_update": datetime.now().isoformat()
            },
            {
                "id": 4,
                "name": "PharmaSyntez Distribution",
                "value": 340000,
                "stage": "Contract",
                "probability": 85,
                "contacts": ["partners@pharmasyntez.ru"],
                "last_update": datetime.now().isoformat()
            }
        ]
    }

def save_pipeline(pipeline):
    """Save deal pipeline"""
    os.makedirs(os.path.dirname(PIPELINE_FILE), exist_ok=True)
    with open(PIPELINE_FILE, 'w') as f:
        json.dump(pipeline, f, indent=2)

def load_contacts():
    """Load MEATSA contacts"""
    if os.path.exists(CONTACTS_FILE):
        with open(CONTACTS_FILE, 'r') as f:
            return json.load(f)
    
    # Default contacts
    return {
        "meat_sa": [
            {"name": "Sales Team", "email": "sales@meatsa.co.za", "role": "Primary"},
            {"name": "Trading Desk", "email": "trading@meatsa.co.za", "role": "Secondary"}
        ],
        "uvelka": [
            {"name": "Export Division", "email": "export@uvelka.ua", "role": "Primary"}
        ]
    }

def get_pipeline_summary():
    """Get pipeline summary stats"""
    pipeline = load_pipeline()
    deals = pipeline.get("deals", [])
    
    total_value = sum(d["value"] for d in deals)
    weighted_value = sum(d["value"] * d["probability"] / 100 for d in deals)
    
    stages = {}
    for deal in deals:
        stage = deal.get("stage", "Unknown")
        stages[stage] = stages.get(stage, 0) + 1
    
    return {
        "total_deals": len(deals),
        "total_value": total_value,
        "weighted_value": weighted_value,
        "stages": stages
    }

def update_deal(deal_id, updates):
    """Update a deal in the pipeline"""
    pipeline = load_pipeline()
    
    for deal in pipeline["deals"]:
        if deal["id"] == deal_id:
            deal.update(updates)
            deal["last_update"] = datetime.now().isoformat()
            save_pipeline(pipeline)
            log(f"Updated deal {deal_id}: {deal['name']}")
            return deal
    
    return {"error": "Deal not found"}

def send_uvelka_update(message):
    """
    Send update to Uvelka
    In production: integrate with email/API
    """
    log(f"Sending Uvelka update: {message[:50]}...")
    
    update = {
        "to": "uvelka@wheat.com",
        "subject": f"StudEx Update - {datetime.now().strftime('%Y-%m-%d')}",
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    
    return update

def add_meatsa_contact(name, email, role="Secondary"):
    """Add a MEATSA contact"""
    contacts = load_contacts()
    
    if "meat_sa" not in contacts:
        contacts["meat_sa"] = []
    
    contacts["meat_sa"].append({
        "name": name,
        "email": email,
        "role": role
    })
    
    os.makedirs(os.path.dirname(CONTACTS_FILE), exist_ok=True)
    with open(CONTACTS_FILE, 'w') as f:
        json.dump(contacts, f, indent=2)
    
    log(f"Added MEATSA contact: {name}")
    return contacts

class DealsAgent:
    """Deals Agent class"""
    
    def __init__(self):
        self.name = "Deals"
        self.status = "active"
        log("Deals Agent initialized")
    
    def run(self, task):
        """Execute deals task"""
        log(f"Executing task: {task}")
        
        task_lower = task.lower()
        
        if "pipeline" in task_lower or "deals" in task_lower:
            if "summary" in task_lower:
                return get_pipeline_summary()
            return load_pipeline()
        elif "uvelka" in task_lower:
            if "update" in task_lower or "send" in task_lower:
                return send_uvelka_update(task)
        elif "contact" in task_lower:
            if "add" in task_lower:
                return add_meatsa_contact("New Contact", "new@example.com")
            return load_contacts()
        elif "stage" in task_lower:
            # Update deal stage
            # Format: "stage 1 -> Contract"
            return {"status": "stage_update", "task": task}
        else:
            return get_pipeline_summary()

if __name__ == "__main__":
    # Test the agent
    agent = DealsAgent()
    
    # Test pipeline summary
    result = agent.run("pipeline summary")
    print(json.dumps(result, indent=2))
    
    # Test contacts
    result = agent.run("contacts")
    print(json.dumps(result, indent=2))

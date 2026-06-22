"""
StudEx Agent OS - Markets Agent
Tracks USDZAR, BRENT, GOLD, SA grain prices
Alert thresholds and market data storage
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path

# Paths
MEMORY_FILE = "/workspace/studex-agent-os/memory/market-data.json"

# Alert thresholds
THRESHOLDS = {
    "usdzar": {"red": 19.0, "amber": 18.5, "green": 18.0},
    "brent": {"red": 90.0, "amber": 85.0, "green": 75.0},
    "gold": {"red": 2400.0, "amber": 2350.0, "green": 2200.0}
}

def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [MARKETS] {msg}")

def get_status(price, thresholds):
    """Determine status based on thresholds"""
    if price > thresholds["red"]:
        return "red"
    elif price > thresholds["amber"]:
        return "amber"
    return "green"

def load_market_data():
    """Load cached market data"""
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            return json.load(f)
    return {
        "prices": {"usdzar": 18.75, "brent": 82.50, "gold": 2340.00},
        "alerts": [],
        "last_updated": datetime.now().isoformat()
    }

def save_market_data(data):
    """Save market data to file"""
    data["last_updated"] = datetime.now().isoformat()
    with open(MEMORY_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    log("Market data saved")

def fetch_prices():
    """
    Fetch current market prices
    In production: integrate with financial APIs
    """
    log("Fetching market prices...")
    
    # Simulated prices (would come from APIs like Alpha Vantage, Yahoo Finance)
    prices = {
        "usdzar": 18.75 + (time.time() % 0.5 - 0.25),  # Simulate fluctuation
        "brent": 82.50 + (time.time() % 2 - 1),
        "gold": 2340.00 + (time.time() % 20 - 10)
    }
    
    # Round to 2 decimal places
    prices = {k: round(v, 2) for k, v in prices.items()}
    
    return prices

def check_alerts(prices):
    """Check for price alerts"""
    alerts = []
    data = load_market_data()
    
    for symbol, price in prices.items():
        status = get_status(price, THRESHOLDS.get(symbol, {}))
        
        if status == "red":
            alerts.append({
                "symbol": symbol.upper(),
                "level": "RED",
                "message": f"{symbol.upper()} at {price} exceeds threshold!",
                "time": datetime.now().isoformat()
            })
            log(f"ALERT RED: {symbol} = {price}")
        elif status == "amber":
            alerts.append({
                "symbol": symbol.upper(),
                "level": "AMBER",
                "message": f"{symbol.upper()} at {price} approaching threshold",
                "time": datetime.now().isoformat()
            })
            log(f"ALERT AMBER: {symbol} = {price}")
    
    # Save alerts
    data["alerts"] = data.get("alerts", []) + alerts
    # Keep only last 50 alerts
    data["alerts"] = data["alerts"][-50:]
    
    return alerts

def update_market_data():
    """Update market data with fresh prices and alerts"""
    prices = fetch_prices()
    alerts = check_alerts(prices)
    
    data = load_market_data()
    data["prices"] = prices
    save_market_data(data)
    
    return {"prices": prices, "alerts": alerts}

def get_sa_grain_prices():
    """
    Get SA grain market data
    Tracks: Wheat, Maize, Soybeans
    """
    log("Fetching SA grain prices...")
    
    # Simulated SA grain prices
    grain_data = {
        "wheat_zar_ton": 4850.00,
        "maize_zar_ton": 3200.00,
        "soy_zar_ton": 7800.00,
        "barley_zar_ton": 4100.00,
        "timestamp": datetime.now().isoformat()
    }
    
    return grain_data

class MarketsAgent:
    """Markets Agent class"""
    
    def __init__(self):
        self.name = "Markets"
        self.status = "active"
        log("Markets Agent initialized")
    
    def run(self, task):
        """Execute market task"""
        log(f"Executing task: {task}")
        
        task_lower = task.lower()
        
        if "update" in task_lower or "refresh" in task_lower:
            return update_market_data()
        elif "alert" in task_lower:
            data = load_market_data()
            return {"alerts": data.get("alerts", [])}
        elif "grain" in task_lower or "sa" in task_lower:
            return get_sa_grain_prices()
        elif "status" in task_lower:
            prices = fetch_prices()
            statuses = {
                symbol: get_status(price, THRESHOLDS.get(symbol, {}))
                for symbol, price in prices.items()
            }
            return {"prices": prices, "statuses": statuses}
        else:
            return update_market_data()

if __name__ == "__main__":
    # Test the agent
    agent = MarketsAgent()
    
    # Test price update
    result = agent.run("update prices")
    print(json.dumps(result, indent=2))
    
    # Test status check
    result = agent.run("status")
    print(json.dumps(result, indent=2))
    
    # Test SA grain
    result = agent.run("get SA grain prices")
    print(json.dumps(result, indent=2))

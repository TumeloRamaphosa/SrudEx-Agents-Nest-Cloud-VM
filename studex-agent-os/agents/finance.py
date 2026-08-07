"""
StudEx Agent OS - Finance Agent
P&L summary, margin reports, and pricing checks
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MEMORY_FILE = BASE_DIR / "memory" / "finance.json"


def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [FINANCE] {msg}")


def seed_finance_data():
    """Default StudEx Meat finance data"""
    return {
        "last_updated": datetime.now().isoformat(),
        "revenue": 125000,
        "cogs": 72000,
        "products": [
            {"sku": "WAGYU-PATTY-1KG", "name": "Wagyu Burger Patties 1kg", "price": 650, "cost": 380},
            {"sku": "TOMAHAWK-1.2KG", "name": "Tomahawk Steak 1.2kg", "price": 1200, "cost": 700},
            {"sku": "BOEREWORS-500G", "name": "Premium Boerewors 500g", "price": 180, "cost": 95},
        ],
    }


def load_finance_data():
    """Load finance memory from file"""
    if MEMORY_FILE.exists():
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)

    data = seed_finance_data()
    save_finance_data(data)
    return data


def save_finance_data(data):
    """Save finance data to file"""
    os.makedirs(MEMORY_FILE.parent, exist_ok=True)
    data["last_updated"] = datetime.now().isoformat()
    with open(MEMORY_FILE, "w") as f:
        json.dump(data, f, indent=2)
    log("Finance data saved")


def margin_report():
    """Return margin report for all products"""
    data = load_finance_data()
    report = []
    for product in data.get("products", []):
        price = product["price"]
        cost = product["cost"]
        margin = price - cost
        margin_pct = round((margin / price) * 100, 2) if price else 0
        markup_pct = round((margin / cost) * 100, 2) if cost else 0
        report.append(
            {
                "sku": product["sku"],
                "name": product["name"],
                "price": price,
                "cost": cost,
                "margin": margin,
                "margin_percent": margin_pct,
                "markup_percent": markup_pct,
            }
        )
    log("Margin report generated")
    return {"report": report, "generated_at": datetime.now().isoformat()}


def pnl_summary():
    """Return P&L summary"""
    data = load_finance_data()
    revenue = data.get("revenue", 0)
    cogs = data.get("cogs", 0)
    gross_profit = revenue - cogs
    gross_margin = round((gross_profit / revenue) * 100, 2) if revenue else 0
    log("P&L summary generated")
    return {
        "revenue": revenue,
        "cogs": cogs,
        "gross_profit": gross_profit,
        "gross_margin_percent": gross_margin,
        "currency": "ZAR",
        "generated_at": datetime.now().isoformat(),
    }


def pricing_check(price, cost):
    """Check margin for a given price and cost"""
    margin = price - cost
    margin_pct = round((margin / price) * 100, 2) if price else 0
    markup_pct = round((margin / cost) * 100, 2) if cost else 0
    recommendation = "healthy" if margin_pct >= 30 else "review" if margin_pct >= 15 else "low"
    log(f"Pricing check: price={price}, cost={cost}, margin={margin_pct}%")
    return {
        "price": price,
        "cost": cost,
        "margin": margin,
        "margin_percent": margin_pct,
        "markup_percent": markup_pct,
        "recommendation": recommendation,
    }


def parse_pricing_task(task):
    """Extract price and cost from task like 'pricing 250 180'"""
    numbers = re.findall(r"\d+(?:\.\d+)?", task)
    if len(numbers) >= 2:
        return float(numbers[0]), float(numbers[1])
    return None, None


class FinanceAgent:
    """Finance Agent class for integration with main app"""

    def __init__(self):
        self.name = "Finance"
        self.status = "active"
        log("Finance Agent initialized")

    def run(self, task):
        """Execute finance task"""
        log(f"Executing task: {task}")

        task_lower = task.lower()

        if "margin" in task_lower:
            return margin_report()
        elif "pnl" in task_lower or "p&l" in task_lower or "summary" in task_lower:
            return pnl_summary()
        elif "pricing" in task_lower or "price" in task_lower:
            price, cost = parse_pricing_task(task)
            if price is not None and cost is not None:
                return pricing_check(price, cost)
            return {"error": "Provide price and cost, e.g. 'pricing 250 180'"}
        else:
            return pnl_summary()


if __name__ == "__main__":
    agent = FinanceAgent()
    print(json.dumps(agent.run("margin report"), indent=2))
    print(json.dumps(agent.run("pnl summary"), indent=2))
    print(json.dumps(agent.run("pricing 250 180"), indent=2))

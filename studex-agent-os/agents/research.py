"""
StudEx Agent OS - Research Agent
Web search, content extraction, market intelligence
Inspired by: Cult UI patterns (ReAct, plan-solve)
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path

# Memory file path
MEMORY_FILE = "/workspace/studex-agent-os/memory/research.md"

def log(msg):
    """Console logger with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [RESEARCH] {msg}")

def load_memory():
    """Load research memory from file"""
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            return f.read()
    return "# Research Memory\n\n*Last updated: " + datetime.now().strftime("%Y-%m-%d %H:%M") + "*\n\n"

def save_memory(content):
    """Save research findings to memory"""
    with open(MEMORY_FILE, 'w') as f:
        f.write(content)
    log("Memory updated")

def search(query):
    """
    Simulated web search capability
    In production: integrate with search APIs
    """
    log(f"Searching for: {query}")
    return {
        "query": query,
        "results": [
            {"title": f"Result for {query}", "url": "https://example.com/1"},
            {"title": f"Related: {query} analysis", "url": "https://example.com/2"}
        ],
        "timestamp": datetime.now().isoformat()
    }

def extract_content(url):
    """
    Extract content from URL
    In production: use web scraping libraries
    """
    log(f"Extracting content from: {url}")
    return {
        "url": url,
        "title": "Extracted Page",
        "content": "Content extracted...",
        "timestamp": datetime.now().isoformat()
    }

def save_finding(topic, data, source=None):
    """
    Save a research finding to memory
    Uses Cult UI plan-solve pattern
    """
    log(f"Saving finding: {topic}")
    
    memory = load_memory()
    
    finding = f"""
## {topic}
- **Date**: {datetime.now().strftime("%Y-%m-%d")}
- **Source**: {source or 'Research Agent'}
- **Data**: {json.dumps(data, indent=2)}
"""
    
    memory += finding + "\n"
    save_memory(memory)
    return "Finding saved to memory"

def research_deal(company_name):
    """
    Research a specific company/deal
    Uses ReAct pattern: Reason + Act
    """
    log(f"Researching deal: {company_name}")
    
    # Step 1: Reason - identify what we need to know
    questions = [
        f"Who are the key contacts at {company_name}?",
        f"What is the market for {company_name}?",
        f"Who are {company_name}'s competitors?"
    ]
    
    # Step 2: Act - execute research tasks
    results = []
    for q in questions:
        results.append(search(q))
    
    # Step 3: Update memory with findings
    save_finding(f"Deal Research: {company_name}", {
        "questions_answered": len(results),
        "initial_findings": [r["query"] for r in results]
    })
    
    return {
        "company": company_name,
        "status": "researched",
        "findings": results
    }

def analyze_market_trend(topic):
    """
    Analyze market trends using last30days pattern
    """
    log(f"Analyzing trend: {topic}")
    
    # Simulate trend analysis
    return {
        "topic": topic,
        "trend": "stable",
        "30day_change": "+2.5%",
        "outlook": "positive"
    }

class ResearchAgent:
    """Research Agent class for integration with main app"""
    
    def __init__(self):
        self.name = "Research"
        self.status = "active"
        log("Research Agent initialized")
    
    def run(self, task):
        """Execute research task"""
        log(f"Executing task: {task}")
        
        if "search" in task.lower():
            query = task.replace("search", "").strip()
            return search(query)
        elif "extract" in task.lower():
            # Extract URL from task
            url_match = re.search(r'https?://[^\s]+', task)
            if url_match:
                return extract_content(url_match.group())
        elif "research" in task.lower():
            # Extract company name
            company = task.replace("research", "").strip()
            return research_deal(company)
        else:
            return {"status": "unknown_task", "task": task}

if __name__ == "__main__":
    # Test the agent
    agent = ResearchAgent()
    
    # Test searches
    result = agent.run("search Uvelka wheat prices")
    print(json.dumps(result, indent=2))
    
    # Test deal research
    result = agent.run("research NTechLab Kenya")
    print(json.dumps(result, indent=2))

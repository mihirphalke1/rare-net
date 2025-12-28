"""
Analytics Service for RareNet

Tracks search patterns, confidence scores, and privacy blocks for dashboard.
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List
from collections import defaultdict, deque
from threading import Lock

# Path to analytics file
DATA_DIR = Path(__file__).parent.parent.parent / "data"
ANALYTICS_FILE = DATA_DIR / "analytics.json"

# Thread lock
_analytics_lock = Lock()

# In-memory cache for hourly data (last 24 hours)
_hourly_searches = deque(maxlen=24)
_disease_searches = defaultdict(int)
_total_searches = 0
_total_confidence = 0.0
_searches_today = 0


def _ensure_data_dir():
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _load_analytics() -> Dict:
    """Load analytics from JSON file."""
    _ensure_data_dir()
    
    if not ANALYTICS_FILE.exists():
        return {
            "total_searches": 0,
            "searches_today": 0,
            "total_confidence_sum": 0.0,
            "disease_counts": {},
            "hourly_searches": [0] * 24,
            "last_reset": datetime.utcnow().date().isoformat()
        }
    
    try:
        with open(ANALYTICS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {
            "total_searches": 0,
            "searches_today": 0,
            "total_confidence_sum": 0.0,
            "disease_counts": {},
            "hourly_searches": [0] * 24,
            "last_reset": datetime.utcnow().date().isoformat()
        }


def _save_analytics(data: Dict):
    """Save analytics to JSON file."""
    _ensure_data_dir()
    
    with open(ANALYTICS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def track_search(disease_name: str, confidence: float):
    """
    Track a successful search query.
    
    Args:
        disease_name: Diagnosed disease name
        confidence: Confidence score (0.0 to 1.0)
    """
    global _total_searches, _total_confidence, _searches_today
    
    with _analytics_lock:
        data = _load_analytics()
        
        # Check if we need to reset daily counter
        today = datetime.utcnow().date().isoformat()
        if data.get("last_reset") != today:
            data["searches_today"] = 0
            data["last_reset"] = today
        
        # Increment counters
        data["total_searches"] = data.get("total_searches", 0) + 1
        data["searches_today"] = data.get("searches_today", 0) + 1
        data["total_confidence_sum"] = data.get("total_confidence_sum", 0.0) + confidence
        
        # Track disease
        if "disease_counts" not in data:
            data["disease_counts"] = {}
        data["disease_counts"][disease_name] = data["disease_counts"].get(disease_name, 0) + 1
        
        # Track hourly (rotate array)
        if "hourly_searches" not in data or len(data["hourly_searches"]) != 24:
            data["hourly_searches"] = [0] * 24
        data["hourly_searches"] = data["hourly_searches"][1:] + [data["searches_today"]]
        
        _save_analytics(data)


def get_analytics() -> Dict:
    """
    Get current analytics data for dashboard.
    
    Returns:
        Dict with analytics metrics
    """
    with _analytics_lock:
        data = _load_analytics()
        
        # Calculate average confidence
        total = data.get("total_searches", 0)
        avg_conf = data.get("total_confidence_sum", 0.0) / total if total > 0 else 0.0
        
        # Get top diseases
        disease_counts = data.get("disease_counts", {})
        top_diseases = [
            {"name": name, "count": count}
            for name, count in sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)
        ][:10]
        
        return {
            "total_searches": data.get("total_searches", 0),
            "searches_today": data.get("searches_today", 0),
            "avg_confidence": round(avg_conf, 2),
            "privacy_blocks": 0,  # Will be tracked by privacy_aggregator
            "top_diseases": top_diseases,
            "searches_by_hour": data.get("hourly_searches", [0] * 24)
        }

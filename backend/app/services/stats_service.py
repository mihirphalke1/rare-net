"""
Network Statistics Service for RareNet

Tracks global network statistics including case counts by hospital and disease.
Uses JSON file storage for simplicity in hackathon demo.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
from threading import Lock

# Path to stats file
DATA_DIR = Path(__file__).parent.parent.parent / "data"
STATS_FILE = DATA_DIR / "network_stats.json"

# Thread lock for concurrent updates
_stats_lock = Lock()


def _ensure_data_dir():
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _load_stats() -> Dict:
    """Load stats from JSON file."""
    _ensure_data_dir()
    
    if not STATS_FILE.exists():
        return {
            "total_cases": 0,
            "cases_by_hospital": {"mumbai": 0, "boston": 0, "london": 0},
            "cases_by_disease": {},
            "contributions_today": 0,
            "last_contribution": None,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    try:
        with open(STATS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {
            "total_cases": 0,
            "cases_by_hospital": {"mumbai": 0, "boston": 0, "london": 0},
            "cases_by_disease": {},
            "contributions_today": 0,
            "last_contribution": None,
            "last_updated": datetime.utcnow().isoformat()
        }


def _save_stats(stats: Dict):
    """Save stats to JSON file."""
    _ensure_data_dir()
    
    stats["last_updated"] = datetime.utcnow().isoformat()
    
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f, indent=2)


def get_network_stats() -> Dict:
    """
    Get current network statistics.
    
    Returns:
        Dict containing:
        - total_cases: Total cases across all hospitals
        - cases_by_hospital: Dict mapping hospital to case count
        - cases_by_disease: Dict mapping disease to case count
        - contributions_today: Cases added today
        - last_contribution: Timestamp of last contribution
        - last_updated: Timestamp of last stats update
    """
    with _stats_lock:
        return _load_stats()


def increment_case_count(hospital: str, disease: str) -> Dict:
    """
    Increment case count for a hospital and disease.
    
    Args:
        hospital: Hospital ID (mumbai, boston, london)
        disease: Disease name
        
    Returns:
        Updated stats dict
    """
    with _stats_lock:
        stats = _load_stats()
        
        # Increment total
        stats["total_cases"] = stats.get("total_cases", 0) + 1
        
        # Increment hospital count
        if "cases_by_hospital" not in stats:
            stats["cases_by_hospital"] = {"mumbai": 0, "boston": 0, "london": 0}
        stats["cases_by_hospital"][hospital] = stats["cases_by_hospital"].get(hospital, 0) + 1
        
        # Increment disease count
        if "cases_by_disease" not in stats:
            stats["cases_by_disease"] = {}
        stats["cases_by_disease"][disease] = stats["cases_by_disease"].get(disease, 0) + 1
        
        # Update contribution tracking
        stats["contributions_today"] = stats.get("contributions_today", 0) + 1
        stats["last_contribution"] = datetime.utcnow().isoformat()
        
        _save_stats(stats)
        return stats


def set_initial_stats(total: int, by_hospital: Dict[str, int], by_disease: Dict[str, int]):
    """
    Set initial stats (used after database seeding).
    
    Args:
        total: Total case count
        by_hospital: Cases per hospital
        by_disease: Cases per disease
    """
    with _stats_lock:
        stats = {
            "total_cases": total,
            "cases_by_hospital": by_hospital,
            "cases_by_disease": by_disease,
            "contributions_today": 0,
            "last_contribution": None,
            "last_updated": datetime.utcnow().isoformat()
        }
        _save_stats(stats)


def reset_daily_contributions():
    """Reset daily contribution counter (call at midnight)."""
    with _stats_lock:
        stats = _load_stats()
        stats["contributions_today"] = 0
        _save_stats(stats)


class StatsService:
    """Singleton service for network statistics."""
    
    def get_stats(self) -> Dict:
        """Get current network statistics."""
        return get_network_stats()
    
    def record_contribution(self, hospital: str, disease: str) -> Dict:
        """Record a new case contribution."""
        return increment_case_count(hospital, disease)
    
    def initialize(self, total: int, by_hospital: Dict[str, int], by_disease: Dict[str, int]):
        """Initialize stats after database seeding."""
        set_initial_stats(total, by_hospital, by_disease)


# Singleton instance
stats_service = StatsService()


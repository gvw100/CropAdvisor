from __future__ import annotations
import requests
from app import settings
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta, timezone

def get_current_weather(lat: float, lon: float):
    url = f"{settings.OWM_BASE_URL}/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": settings.OWM_API_KEY, "units": "metric"}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()

def get_forecasted_weather(lat: float, lon: float):
    url = f"{settings.OWM_BASE_URL}/data/2.5/forecast"
    params = {"lat": lat, "lon": lon, "appid": settings.OWM_API_KEY, "units": "metric"}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()

def get_forecast_for_chart(lat: float, lon: float) -> Dict[str, Any]:
    data = get_forecasted_weather(lat, lon)

    lst: List[Dict[str, Any]] = data.get("list") or []
    city = data.get("city") or {}
    tz_offset_s = int(city.get("timezone", 0) or 0)
    tz = timezone(timedelta(seconds=tz_offset_s))

    buckets: Dict[str, Dict[str, Any]] = {}
    for it in lst:
        dt = it.get("dt")
        if not isinstance(dt, int):
            continue

        # bucket by local date
        local_day = datetime.fromtimestamp(dt, tz=tz).date().isoformat()

        t = _safe_float(_get(it, "main", "temp"))
        pop = _safe_float(it.get("pop"), default=0.0)
        r3h = _safe_float(_get(it, "rain", "3h"), default=0.0)
        r1h = _safe_float(_get(it, "rain", "1h"), default=0.0)
        rain = r3h if r3h else r1h

        b = buckets.setdefault(local_day, {"temps": [], "rain": 0.0, "popmax": 0.0, "dt": dt})
        if t is not None:
            b["temps"].append(t)
        b["rain"] += rain
        b["popmax"] = max(b["popmax"], pop)
        b["dt"] = min(b["dt"], dt)  # keep earliest ts for the day

    # Build ordered output (first 5 days)
    out_daily: List[Dict[str, Any]] = []
    for d in sorted(buckets.keys())[:5]:
        b = buckets[d]
        temps = b["temps"]
        tmin = min(temps) if temps else float("nan")
        tmax = max(temps) if temps else float("nan")
        out_daily.append({
            "dt": b["dt"],                         # unix (seconds)
            "tMin": round(tmin, 1) if temps else float("nan"),
            "tMax": round(tmax, 1) if temps else float("nan"),
            "rainMm": round(b["rain"], 2),
            "pop": round(b["popmax"], 2),          # 0..1
        })

    return {
        "city": {
            "name": city.get("name"),
            "timezone": tz_offset_s,
        },
        "daily": out_daily,
    }

# -------- helpers --------

def _get(d: Dict[str, Any], *path: str, default=None):
    cur = d
    for p in path:
        if not isinstance(cur, dict) or p not in cur:
            return default
        cur = cur[p]
    return cur

def _safe_float(v, default=None):
    try:
        if v is None:
            return default
        return float(v)
    except (ValueError, TypeError):
        return default
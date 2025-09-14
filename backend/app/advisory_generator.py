# backend/app/advisory_generator.py
from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, timedelta, timezone
import hashlib
import math

# ----------------------------
# small helpers
# ----------------------------

def _id(seed: str) -> str:
    return hashlib.md5(seed.encode()).hexdigest()[:8]

def _is_kelvin(temp: float) -> bool:
    # crude but effective: typical outdoor temps won't exceed 200 if in °C; if > 200, assume Kelvin
    return temp is not None and temp > 200

def _to_celsius(t: Optional[float]) -> Optional[float]:
    if t is None:
        return None
    return t - 273.15 if _is_kelvin(t) else t

def _mm(val: Optional[float]) -> float:
    return float(val or 0)

def _safe_get(d: Dict[str, Any], *path: str, default=None):
    cur = d
    for p in path:
        if not isinstance(cur, dict) or p not in cur:
            return default
        cur = cur[p]
    return cur

def _unix_utc_now() -> int:
    return int(datetime.now(timezone.utc).timestamp())

# ----------------------------
# aggregation: next 48h from 3h forecast 
# ----------------------------

def _summarize_next_48h(forecast: Dict[str, Any]) -> Tuple[float, float, float, float, float]:
    """
    Returns: tMax48 (°C), tMin48 (°C), windMax48 (m/s), rainTotal48 (mm), popMax48 (0..1)
    Only considers items between now..now+48h. Uses rain['3h'] when available, else rain['1h'].
    """
    now = _unix_utc_now()
    cutoff = now + 48 * 3600
    lst: List[Dict[str, Any]] = forecast.get("list") or []

    temps: List[float] = []
    winds: List[float] = []
    pops: List[float]  = []
    rain_total = 0.0

    for it in lst:
        dt = it.get("dt")
        if not isinstance(dt, int):
            continue
        if dt < now or dt > cutoff:   # skip past items and those beyond 48h
            continue

        t = _to_celsius(_safe_get(it, "main", "temp"))
        if t is not None:
            temps.append(t)

        wind = _safe_get(it, "wind", "speed", default=0.0)
        winds.append(float(wind or 0.0))

        pop = it.get("pop", 0.0) or 0.0
        pops.append(float(pop))

        # FREE plan: 3-hour accumulations live in rain['3h']
        r3h = _safe_get(it, "rain", "3h", default=0.0) or 0.0
        # some payloads may only have 1h
        r1h = _safe_get(it, "rain", "1h", default=0.0) or 0.0
        rain_total += float(r3h or r1h or 0.0)

    tMax48 = max(temps) if temps else float("nan")
    tMin48 = min(temps) if temps else float("nan")
    windMax48 = max(winds) if winds else 0.0
    popMax48 = max(pops) if pops else 0.0

    return tMax48, tMin48, windMax48, rain_total, popMax48

# ----------------------------
# daily series for charts (5 rows) from 3h forecast, bucketed by LOCAL tz
# ----------------------------

def _daily_series_from_forecast(forecast: Dict[str, Any], days: int = 5) -> List[Dict[str, Any]]:
    """
    Build up to 5 daily points: { dt, tMin, tMax, rainMm, pop }
    Day buckets are based on forecast['city']['timezone'] (seconds offset from UTC).
    """
    lst: List[Dict[str, Any]] = forecast.get("list") or []
    tz_offset_s = int((forecast.get("city") or {}).get("timezone", 0) or 0)
    tz = timezone(timedelta(seconds=tz_offset_s))
    buckets: Dict[str, Dict[str, Any]] = {}

    for it in lst:
        dt = it.get("dt")
        if not isinstance(dt, int):
            continue
        # use local tz to bucket by calendar day
        local_day = datetime.fromtimestamp(dt, tz=tz).date().isoformat()

        t = _to_celsius(_safe_get(it, "main", "temp"))
        pop = float(it.get("pop", 0.0) or 0.0)
        r3h = float(_safe_get(it, "rain", "3h", default=0.0) or 0.0)
        r1h = float(_safe_get(it, "rain", "1h", default=0.0) or 0.0)
        rain = r3h if r3h else r1h

        b = buckets.setdefault(local_day, {"temps": [], "rain": 0.0, "popmax": 0.0, "dt": dt})
        if t is not None:
            b["temps"].append(t)
        b["rain"] += rain
        b["popmax"] = max(b["popmax"], pop)
        b["dt"] = min(b["dt"], dt)  # keep earliest timestamp for the day

    out: List[Dict[str, Any]] = []
    for d in sorted(buckets.keys())[:days]:
        b = buckets[d]
        temps = b["temps"]
        tmin = min(temps) if temps else float("nan")
        tmax = max(temps) if temps else float("nan")
        out.append({
            "dt": b["dt"],
            "tMin": tmin,
            "tMax": tmax,
            "rainMm": round(b["rain"], 2),
            "pop": round(b["popmax"], 2),
        })
    return out

# ----------------------------
# advisory rule engine (small & pragmatic)
# ----------------------------

def _build_advisories(current: Dict[str, Any], forecast: Dict[str, Any], crop: str) -> List[Dict[str, Any]]:
    tMax48, tMin48, windMax48, rainTotal48, popMax48 = _summarize_next_48h(forecast)

    # current snapshots
    cur_temp = _to_celsius(_safe_get(current, "main", "temp"))
    rh_now = int(_safe_get(current, "main", "humidity", default=0) or 0)
    wind_now = float(_safe_get(current, "wind", "speed", default=0.0) or 0.0)
    rain1h_now = float(_safe_get(current, "rain", "1h", default=0.0) or 0.0)

    advisories: List[Dict[str, Any]] = []

    # --- Irrigation ---
    if not math.isnan(tMax48) and (tMax48 >= 28) and (rainTotal48 < 2.0 or popMax48 < 0.3):
        severity = "high" if (tMax48 >= 32 and rh_now <= 40) else "medium"
        advisories.append({
            "id": _id(f"irrigation{tMax48}{rainTotal48}{rh_now}"),
            "type": "irrigation",
            "severity": severity,
            "title": "Irrigation advisable",
            "reason": f"Hot & dry window (max {tMax48:.0f}°C; rain next 48h ≈ {rainTotal48:.0f} mm).",
            "action": "Irrigate early; check soil moisture and avoid runoff.",
            "tags": ["heat", "water"],
        })

    # --- Fungal risk ---
    if (rainTotal48 >= 5.0 or popMax48 >= 0.6) and rh_now >= 85:
        severity = "high" if rainTotal48 >= 10.0 else ("medium" if (rainTotal48 >= 5.0 or popMax48 >= 0.8) else "low")
        advisories.append({
            "id": _id(f"fungal{rainTotal48}{popMax48}{rh_now}"),
            "type": "fungal_risk",
            "severity": severity,
            "title": "Fungal disease risk",
            "reason": f"Humid conditions (RH {rh_now}%)+precip in next 48h ({rainTotal48:.0f} mm, POP {int(popMax48*100)}%).",
            "action": "Scout susceptible areas; consider preventive spray if label-appropriate.",
            "tags": ["disease"],
        })

    # --- Frost risk ---
    if not math.isnan(tMin48) and tMin48 <= 2:
        severity = "high" if tMin48 <= 0 else "medium"
        advisories.append({
            "id": _id(f"frost{tMin48}"),
            "type": "frost_risk",
            "severity": severity,
            "title": "Frost risk",
            "reason": f"Forecast min {tMin48:.0f}°C within 48h.",
            "action": "Protect tender crops (covers/overhead irrigation) where feasible.",
            "tags": ["cold"],
        })

    # --- Wind caution (spraying) ---
    if windMax48 >= 5.0:
        severity = "high" if windMax48 >= 7.0 else "medium"
        advisories.append({
            "id": _id(f"wind{windMax48}"),
            "type": "wind_caution",
            "severity": severity,
            "title": "Windy for spraying",
            "reason": f"Peak wind {windMax48:.1f} m/s expected; drift risk rises.",
            "action": "Avoid spraying during peak gusts; resume when breeze is steady/gentle.",
            "tags": ["spraying", "drift"],
        })

    # --- Heat stress ---
    if not math.isnan(tMax48) and tMax48 >= 30:
        severity = "high" if tMax48 >= 35 else "medium"
        advisories.append({
            "id": _id(f"heat{tMax48}"),
            "type": "heat_stress",
            "severity": severity,
            "title": "Heat stress window",
            "reason": f"High temperature up to {tMax48:.0f}°C within 48h.",
            "action": "Irrigate early; monitor for leaf scorch and wilting.",
            "tags": ["heat"],
        })

    return advisories

# ----------------------------
# public entrypoint
# ----------------------------

def generate_advisory_payload(
    lat: float,
    lon: float,
    crop: str,
    current_weather: Dict[str, Any],
    forecasted_weather: Dict[str, Any],
    label: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Returns a UI-ready payload:
    {
      location: { lat, lon, label },
      crop: str,
      weather: {
        currentTemp, currentHumidity, currentWind, currentRainMm1h,
        daily: [{dt, tMin, tMax, rainMm, pop}]  # ~5 rows
      },
      advisories: [ {id, type, severity, title, reason, action, tags[]} ]
    }
    """
    # current snapshots (defensive about units/fields)
    cur_temp = _to_celsius(_safe_get(current_weather, "main", "temp"))
    cur_hum  = int(_safe_get(current_weather, "main", "humidity", default=0) or 0)
    cur_wind = float(_safe_get(current_weather, "wind", "speed", default=0.0) or 0.0)
    cur_rain1h = float(_safe_get(current_weather, "rain", "1h", default=0.0) or 0.0)

    daily_series = _daily_series_from_forecast(forecasted_weather, days=5)
    advisories = _build_advisories(current_weather, forecasted_weather, crop)

    # location label fallback
    if not label or not str(label).strip():
        label = f"{lat:.4f}, {lon:.4f}"

    return {
        "location": {"lat": lat, "lon": lon, "label": label},
        "crop": crop,
        "weather": {
            "currentTemp": cur_temp,
            "currentHumidity": cur_hum,
            "currentWind": cur_wind,
            "currentRainMm1h": cur_rain1h,
            "daily": daily_series,
        },
        "advisories": advisories,
    }

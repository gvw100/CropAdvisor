import requests
from app import settings

def map_to_string(loc): 
    parts: List[str] = []
    name = loc.get("name")
    state = loc.get("state")
    country = loc.get("country")
    if name and isinstance(name, str):
        parts.append(name.strip())
    if state and isinstance(state, str):
        parts.append(state.strip())
    if country and isinstance(country, str):
        parts.append(country.strip())
    if parts:
        return ", ".join(parts)
    else:
        return ""

def get_locations(location_raw: str):
    url = f"{settings.OWM_BASE_URL}/geo/1.0/direct"
    params = {"q": location_raw, "limit": 5, "appid": settings.OWM_API_KEY}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    items = resp.json()
    return [
        {
            "label": map_to_string(item),
            "lat": item.get("lat"),
            "lon": item.get("lon"),
        }
        for item in items
        if "lat" in item and "lon" in item
    ]

def get_label(lat: float, lon: float):
    url = f"{settings.OWM_BASE_URL}/geo/1.0/reverse"
    params = {"lat": lat, "lon": lon, "limit": 1, "appid": settings.OWM_API_KEY}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return map_to_string(resp.json()[0])

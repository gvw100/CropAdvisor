import requests
from app import settings

def get_current_weather(lat: float, lon: float):
    url = f"{settings.OWM_BASE_URL}/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": settings.OWM_API_KEY}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()

def get_forecasted_weather(lat: float, lon: float):
    url = f"{settings.OWM_BASE_URL}/data/2.5/forecast"
    params = {"lat": lat, "lon": lon, "appid": settings.OWM_API_KEY}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()
import os, requests
from app import settings

def get_current_weather(lat: float, lon: float):
    url = f"{settings.OWM_BASE_URL}/data/2.5/weather?lat={lat}&lon={lon}&appid={settings.OWM_API_KEY}"
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()
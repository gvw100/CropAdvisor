from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from app import weather_client as weather
from app.advisory_generator import generate_advisory
from app import settings
  
if not settings.OWM_API_KEY:
        sys.exit("OWM_API_KEY must be set to start the server")

app = FastAPI(title="Weather-Based Crop Advisory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/advisory")
def advisory(lat: float, lon: float):
    current_weather = weather.get_current_weather(lat, lon)
    return current_weather

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import weather_client as weather
from app import geocode_client as geocode
from app.advisory_generator import generate_advisory_payload
from app import settings
  
if not settings.OWM_API_KEY:
        sys.exit("OWM_API_KEY must be set to start the server")

app = FastAPI(title="Weather-Based Crop Advisory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/locations")
def locations(location: str):
    return geocode.get_locations(location)

@app.get("/advisory")
def advisory(lat: float, lon: float, crop: str):
    current_weather = weather.get_current_weather(lat, lon)
    forecasted_weather = weather.get_forecasted_weather(lat, lon)
    label = geocode.get_label(lat, lon)
    return generate_advisory_payload(
        lat=lat,
        lon=lon,
        crop=crop,
        current_weather=current_weather,
        forecasted_weather=forecasted_weather,
        label=label,
    )

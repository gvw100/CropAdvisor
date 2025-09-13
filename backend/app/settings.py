from dotenv import load_dotenv
from pathlib import Path
import os

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)

OWM_API_KEY = os.getenv("OWM_API_KEY")
OWM_BASE_URL = os.getenv("OWM_BASE_URL")
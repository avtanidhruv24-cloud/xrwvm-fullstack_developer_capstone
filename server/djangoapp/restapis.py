
import os
import requests
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()

backend_url = os.getenv("backend_url", "http://localhost:3030").rstrip("/")
sentiment_analyzer_url = os.getenv(
    "sentiment_analyzer_url",
    "http://localhost:5050/"
).rstrip("/") + "/"


def get_request(endpoint, **kwargs):
    """Send a GET request to the Node.js backend."""
    url = f"{backend_url}/{endpoint.lstrip('/')}"
    response = requests.get(url, params=kwargs, timeout=15)
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    """Analyze review sentiment using the sentiment analyzer service."""
    url = sentiment_analyzer_url + "analyze/" + quote(text, safe="")
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as error:
        print(f"Sentiment analysis request failed: {error}")
        return {}


def post_review(data_dict):
    """Send a new review to the Node.js backend."""
    url = f"{backend_url}/insert_review"
    response = requests.post(url, json=data_dict, timeout=15)
    response.raise_for_status()
    return response.json()

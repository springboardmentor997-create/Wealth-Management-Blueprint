import requests

URL = "https://military-jobye-haiqstudios-14f59639.koyeb.app/stock"
params = {"symbol": "TCS", "res": "num"}

try:
    print(f"Testing {URL}...")
    res = requests.get(URL, params=params, timeout=10)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:200]}...") # Print first 200 chars
except Exception as e:
    print(f"Error: {e}")


import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv('backend/key.env')
api_key = os.getenv('GEMINI_API_KEY')
print(f"Key loaded: {api_key[:5]}...")

client = genai.Client(api_key=api_key)

models_to_try = [
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-latest',
    'gemini-1.0-pro',
    'gemini-1.5-flash',
]
print(f"SDK Version: {genai.__version__}")

for m in models_to_try:
    print(f"\nTesting {m}...")
    try:
        response = client.models.generate_content(
            model=m,
            contents='Hello',
        )
        print(f"✅ Success with {m}: {response.text}")
        break  
    except Exception as e:
        print(f"❌ Failed with {m}: {e}")

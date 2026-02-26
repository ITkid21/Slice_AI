
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv('backend/key.env')
api_key = os.getenv('GEMINI_API_KEY')
print(f"Key loaded: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("No API Key found!")
    exit(1)

genai.configure(api_key=api_key)

print("Listing models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"List Models Error: {e}")

print("\nTesting gemini-1.5-flash...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, can you verify you are working?")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"1.5-Flash Error: {e}")

print("\nTesting gemini-pro...")
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello, are you there?")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Pro Error: {e}")

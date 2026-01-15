
import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

sys.path.append(os.getcwd())
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("No API Key found")
    sys.exit(1)

genai.configure(api_key=api_key)

print("Listing available models...")
try:
    for m in genai.list_models():
        print(f"Name: {m.name}")
        print(f"Supported generation methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")

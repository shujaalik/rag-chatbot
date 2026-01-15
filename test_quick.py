
import os
import sys
import unittest
from fastapi.testclient import TestClient

# Add current directory to path so we can import backend
sys.path.append(os.getcwd())

# Ensure we load env vars correctly
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

from backend.main import app

class TestQuick(unittest.TestCase):
    def test_upload_and_chat(self):
        with TestClient(app) as client:
            file_path = os.path.join(os.getcwd(), "data", "dummy.txt")
            
            print(f"Uploading {file_path}...")
            with open(file_path, "rb") as f:
                response = client.post(
                    "/upload",
                    files={"file": ("dummy.txt", f, "text/plain")}
                )
            
            if response.status_code != 200:
                print(f"Upload failed: {response.text}")
            
            self.assertEqual(response.status_code, 200)
            print("Upload successful.")

            # Chat
            query = "What is the ESP32-S3?"
            print(f"Querying: {query}")
            response = client.post(
                "/chat",
                json={"query": query}
            )
            
            if response.status_code != 200:
                 print(f"Chat failed: {response.text}")

            self.assertEqual(response.status_code, 200)
            data = response.json()
            print(f"Response: {data.get('response')}")
            self.assertTrue(len(data.get("response", "")) > 0)

if __name__ == "__main__":
    unittest.main()

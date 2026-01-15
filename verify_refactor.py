
import os
import sys
import unittest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add current directory to path so we can import backend
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

# Mock environment variable if not set, to avoid startup warnings/errors during test import
if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "dummy_key"

from backend.main import app
from backend.gemini_service import GeminiEmbedding, get_embedding_model, get_llm_model

class TestGeminiRefactor(unittest.TestCase):
    @patch("backend.gemini_service.Gemini")
    def test_gemini_service_configuration(self, mock_gemini):
        """Verify that gemini_service returns correct objects."""
        embed_model = get_embedding_model()
        self.assertIsInstance(embed_model, GeminiEmbedding)
        self.assertEqual(embed_model._model_name, "models/text-embedding-004")
        
        # Test get_llm_model uses the configured key and model
        get_llm_model()
        mock_gemini.assert_called_with(model="models/gemini-1.5-flash", api_key=os.environ["GOOGLE_API_KEY"])

    def test_app_startup(self):
        """Verify that FastAPI app can start (TestClient init does this)."""
        with TestClient(app) as client:
            response = client.get("/docs") # Just check if we can hit a docs endpoint or similar
            self.assertEqual(response.status_code, 200)

    @patch("backend.gemini_service.genai.embed_content")
    def test_embedding_call(self, mock_embed):
        """Verify that GeminiEmbedding calls genai.embed_content correctly."""
        mock_embed.return_value = {'embedding': [0.1, 0.2, 0.3]}
        
        embed_model = GeminiEmbedding()
        result = embed_model._get_text_embedding("hello world")
        
        mock_embed.assert_called_with(
            model="models/text-embedding-004",
            content="hello world",
            task_type="retrieval_document",
            title=None
        )
        self.assertEqual(result, [0.1, 0.2, 0.3])

if __name__ == "__main__":
    unittest.main()

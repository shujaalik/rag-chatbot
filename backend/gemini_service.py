import os
import asyncio
from typing import Any, List
import google.generativeai as genai
from llama_index.core.embeddings import BaseEmbedding
from llama_index.llms.gemini import Gemini
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY not found in environment variables.")

# Configure the global genai instance
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


class GeminiEmbedding(BaseEmbedding):
    """
    Custom Embedding class using Google's generativeai library directly
    to support models like 'models/text-embedding-004'.
    """
    
    _model_name: str = "models/text-embedding-004"

    def __init__(self, model_name: str = "models/text-embedding-004", **kwargs: Any):
        super().__init__(**kwargs)
        self._model_name = model_name

    def _get_query_embedding(self, query: str) -> List[float]:
        """Get query embedding."""
        return self._get_text_embedding(query)

    async def _aget_query_embedding(self, query: str) -> List[float]:
        """Get query embedding async."""
        return await asyncio.get_running_loop().run_in_executor(
            None, self._get_query_embedding, query
        )

    def _get_text_embedding(self, text: str) -> List[float]:
        """Get text embedding."""
        if not GOOGLE_API_KEY:
             raise ValueError("GOOGLE_API_KEY not set")
        
        result = genai.embed_content(
            model=self._model_name,
            content=text,
            task_type="retrieval_document", 
            title=None
        )
        return result['embedding']

    async def _aget_text_embedding(self, text: str) -> List[float]:
        """Get text embedding async."""
        return await asyncio.get_running_loop().run_in_executor(
            None, self._get_text_embedding, text
        )


def get_embedding_model() -> BaseEmbedding:
    """Returns the configured GeminiEmbedding instance."""
    return GeminiEmbedding(model_name="models/text-embedding-004")


def get_llm_model() -> Gemini:
    """Returns the configured Gemini LLM instance."""
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not set")
    
    return Gemini(model="models/gemini-flash-latest", api_key=GOOGLE_API_KEY)

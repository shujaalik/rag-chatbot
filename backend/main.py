import os
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LlamaIndex imports
from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage,
    Settings,
)
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# Load environment variables
load_dotenv()

# Configuration
DATA_DIR = "./data"
PERSIST_DIR = "./storage"

# Initialize FastAPI
app = FastAPI(title="SimpleRAG Chatbot API")

# CORS Setup
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Index
index = None

# Configure LlamaIndex Settings
# We use HuggingFace embeddings to generate vectors locally
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Check for Gemini API Key and configure LLM
google_api_key = os.getenv("GOOGLE_API_KEY")
if google_api_key:
    Settings.llm = Gemini(model="models/gemini-1.5-flash", api_key=google_api_key)
else:
    print("WARNING: GOOGLE_API_KEY not found. Chat functionality may fail.")


def get_index():
    """
    Load the index from storage if it exists, otherwise return None.
    Updates the global 'index' variable.
    """
    global index
    if index:
        return index

    if os.path.exists(PERSIST_DIR):
        print("Loading index from storage...")
        try:
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)
            return index
        except Exception as e:
            print(f"Error loading index: {e}")
            return None
    return None


@app.on_event("startup")
async def startup_event():
    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)
    # Attempt to load index
    get_index()


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    response: str


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global index
    try:
        # Save file to data directory
        file_path = os.path.join(DATA_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Load data using SimpleDirectoryReader
        # We only load the new file for simplicity in this specific request flow,
        # but typically you might read the whole directory or just the new file.
        # Here we re-index everything in data dir or just the new file?
        # User requested: "Accepts a PDF file... loads it... builds a vector index"
        # Simplest approach: Load the specific file and create/update index.
        # But VectorStoreIndex.from_documents usually creates a new one unless we insert.
        # For simplicity in this "scaffold", we will recreate the index from the data dir to ensure consistency.
        
        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
        
        # In a real app we might want to update the existing index, 
        # but 'from_documents' creates a fresh one. 
        # Given the prompt implies "upload a PDF... index it", we'll create a new index for simplicity
        # or verify if we can insert.
        
        if index is None:
             index = VectorStoreIndex.from_documents(documents)
        else:
            # Insert logic or just rebuild. Rebuilding is safer for "from scratch" MVP to avoid duplication if re-uploaded.
            # Let's rebuild from the single file to keep it very specific to "User uploads PDF -> Index it"
            # Just indexing the uploaded file implies we only chat with that file?
            # Or multiple files? "Scaffold... upload A PDF... chat with THE document".
            # Implies single-doc RAG or at least session-based.
            # Let's simple-index the uploaded file.
            index = VectorStoreIndex.from_documents(documents)

        # Persist
        index.storage_context.persist(persist_dir=PERSIST_DIR)

        return {"message": f"Successfully uploaded and indexed {file.filename}"}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    global index
    current_index = get_index()
    
    if not current_index:
        raise HTTPException(status_code=400, detail="No index found. Please upload a document first.")

    try:
        query_engine = current_index.as_query_engine()
        response = query_engine.query(request.query)
        return {"response": str(response)}
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

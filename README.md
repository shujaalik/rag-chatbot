# SimpleRAG-Chatbot

A full-stack RAG (Retrieval-Augmented Generation) application allowing users to upload PDF documents, index them using LlamaIndex and ChromaDB, and chat with the content via a React frontend.

## Features
- **PDF Upload**: Upload and index documents using LlamaIndex.
- **RAG Chat**: Context-aware chat using Vector Search and LLM (Gemini or OpenAI).
- **Modern UI**: Built with React (Vite), Tailwind CSS, and Lucide Icons.

## Tech Stack
- **Backend**: Python (FastAPI), LlamaIndex, ChromaDB.
- **Frontend**: React, Vite, Tailwind CSS.
- **LLM Provider**: Google Gemini (via `llama-index-llms-gemini`) or generic OpenAI compatible.

## Prerequisites
- Python 3.9+
- Node.js 18+
- Google API Key (for Gemini)

## Setup & Running


### Quick Start (Makefile)
To setup and run everything with a single command:
```bash
make setup
make start
```

### Manual Setup & Running

### 1. Backend
1.  Navigate to the project root.
2.  Create a virtual environment:
    ```bash
    python -m venv .venv
    source .venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r backend/requirements.txt
    ```
4.  Configure Environment:
    - Edit `backend/.env` and add your API Key:
    ```env
    GOOGLE_API_KEY=your_key_here
    ```
5.  Run the server:
    ```bash
    uvicorn backend.main:app --reload
    ```
    API will be available at `http://localhost:8000`.

### 2. Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # Note: If using Tailwind v4, ensure @tailwindcss/postcss is installed (already included)
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

## Usage
1. Open the Frontend URL.
2. Upload a PDF using the Sidebar logic.
3. Wait for the success message ("Successfully indexed...").
4. Type your question in the chat bar and hit Send.

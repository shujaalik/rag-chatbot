
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (some libraries might need build-essential)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY backend/requirements.txt .

# Install Dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY backend ./backend
# Copy data directory if needed (or mount it) - creating empty dir
RUN mkdir -p data storage

# Expose port
EXPOSE 3000

# Run command
# Using --loop asyncio because nest_asyncio is incompatible with uvloop
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "3000", "--loop", "asyncio"]

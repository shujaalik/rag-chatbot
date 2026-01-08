.PHONY: all setup install run-backend run-frontend start clean

# Default shell
SHELL := /bin/bash

# Configuration
PYTHON_VENV := .venv
PYTHON_BIN := $(PYTHON_VENV)/bin/python
PIP := $(PYTHON_VENV)/bin/pip
UVICORN := $(PYTHON_VENV)/bin/uvicorn

all: setup

# Setup environment
setup: install
	@echo "Setup complete. Don't forget to set your GOOGLE_API_KEY in backend/.env"

# Install dependencies
install:
	@echo "Installing Backend Dependencies..."
	python3 -m venv $(PYTHON_VENV)
	$(PIP) install -r backend/requirements.txt
	@echo "Installing Frontend Dependencies..."
	cd frontend && npm install

# Run Backend
run-backend:
	@echo "Starting Backend..."
	$(UVICORN) backend.main:app --reload --port 8000

# Run Frontend
run-frontend:
	@echo "Starting Frontend..."
	cd frontend && npm run dev

# Run both services (Parallel)
start:
	@echo "Starting Application (Backend + Frontend)..."
	@trap 'kill 0' EXIT; \
	$(MAKE) run-backend & \
	$(MAKE) run-frontend & \
	wait

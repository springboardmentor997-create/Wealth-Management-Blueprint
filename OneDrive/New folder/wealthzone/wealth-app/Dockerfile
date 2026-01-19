# Multi-stage build for FastAPI backend and React frontend

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/wealth_frontend
COPY wealth_frontend/package*.json ./
RUN npm install
COPY wealth_frontend/ .
RUN npm run build

# Stage 2: Python FastAPI backend
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY fastapi_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI backend
COPY fastapi_backend/ ./fastapi_backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/wealth_frontend/dist ./static

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run FastAPI server
CMD ["python", "-m", "uvicorn", "fastapi_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

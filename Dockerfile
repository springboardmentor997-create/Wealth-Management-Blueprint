# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Build frontend
COPY frontend/ .
RUN npm run build

# Stage 2: Backend & Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ ./backend/

# Copy Built Frontend from Stage 1
# Copying to a path relative to /app/backend so the layout matches local dev
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set working directory to backend so imports like 'from core.database' work
WORKDIR /app/backend

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run Application
# main.py is in the current directory (/app/backend)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

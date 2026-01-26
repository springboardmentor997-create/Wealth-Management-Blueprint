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
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set working directory to root /app
WORKDIR /app

# Explicitly add backend to PYTHONPATH so 'import core' works from anywhere
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run Application
# Run as a module from the root. 'backend.main' works because PYTHONPATH includes /app/backend
# AND 'backend' is a package under /app.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

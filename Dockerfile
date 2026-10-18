# ==============================================================================
# Multi-Stage Dockerfile for CivicLens AI
# Stage 1: Build React/Vite Frontend
# Stage 2: FastAPI Python Backend & SPA Server
# ==============================================================================

# --- STAGE 1: Frontend Build ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# --- STAGE 2: Python Runtime ---
FROM python:3.12-slim AS runner
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

# Install minimal OS dependencies for psycopg2 and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy compiled frontend from Stage 1 into standard dist paths
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./backend/static/dist

# Ensure upload directory exists with proper permissions
RUN mkdir -p ./backend/uploads ./backend/static

EXPOSE 8000

WORKDIR /app/backend

# Use shell parameter substitution so Render's dynamic $PORT is respected
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

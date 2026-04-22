# Stage 1: Build the React frontend
FROM node:22 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI backend
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    libwebp-dev \
    libtiff-dev \
    libfreetype6-dev \
    zlib1g-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy the backend source
COPY . .

# Copy the built frontend from Stage 1 into the location expected by FastAPI
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Start the web app and Celery worker in one container for Railway deployments.
# docker-compose overrides this per-service during local development.
CMD ["sh", "-c", "trap 'kill 0' TERM INT; celery -A worker.celery_app worker --loglevel=${CELERY_LOGLEVEL:-info} & exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-5601}"]
EXPOSE 5601

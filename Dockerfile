FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ONLY the backend code directly into /app
COPY backend/ .

# Set a default port (Cloud Run will override with its own PORT env var)
ENV PORT=8080
EXPOSE 8080

# Use shell form so $PORT is expanded by the shell
CMD uvicorn main:app --host 0.0.0.0 --port $PORT

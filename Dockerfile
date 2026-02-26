FROM python:3.11-slim

WORKDIR /app

# Copy requirements from backend folder
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code into /app
COPY backend/ .

# Ensure env file is loaded if present (though we use Cloud Env Vars)
# Run uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

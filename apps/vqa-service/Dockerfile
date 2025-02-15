# Use Python 3.11 slim base image
FROM rocm/pytorch:rocm6.2.3_ubuntu22.04_py3.10_pytorch_release_2.3.0

# Define build arguments for certificate paths
ARG SSL_CERT_FILE
ARG SSL_KEY_FILE

# Set working directory
WORKDIR /app

# Install system dependencies required for PyTorch and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Copy SSL certificates
COPY ${SSL_CERT_FILE:-cert.pem} /app/cert.pem
COPY ${SSL_KEY_FILE:-key.pem} /app/key.pem

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV MODEL_CACHE_DIR=/app/.model_cache
# ENV MODEL_URL=""

# Create mount point for model cache
# This directory will be overlaid by the bind mount at runtime
RUN mkdir -p /app/.model_cache

# Expose the port the app runs on
EXPOSE 7004

# Set the working directory
WORKDIR /app/src

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7004", "--ssl-keyfile", "/app/key.pem", "--ssl-certfile", "/app/cert.pem"]

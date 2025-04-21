# Use Python 3.11 slim base image
FROM rocm/pytorch:rocm6.2.3_ubuntu22.04_py3.10_pytorch_release_2.3.0


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

# Create necessary directories with appropriate permissions
RUN mkdir -p /app/logs && \
    chmod -R 777 /app/logs

# Copy the rest of the application
COPY . .


# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/src/transformers_modules

# Mount point /app/.model_cache will be created automatically by Docker bind mount

# Expose the port the app runs on
EXPOSE 7004

# Set the working directory
WORKDIR /app/src

# Command to run the application
CMD ["python", "bootstrap.py"]
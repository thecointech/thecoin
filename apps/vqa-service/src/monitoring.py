import psutil
from functools import wraps
import time
from typing import Callable
import tracemalloc
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from logger import setup_logger

logger = setup_logger(__name__)

class ResourceMonitoringMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        
    async def dispatch(self, request: Request, call_next):
        # Start memory tracking
        tracemalloc.start()
        start_time = time.time()
        
        try:
            # Get initial measurements
            process = psutil.Process()
            start_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            # Execute the request
            response = await call_next(request)
            
            # Get final measurements
            end_memory = process.memory_info().rss / 1024 / 1024
            duration = time.time() - start_time
            
            # Get memory peak
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            
            # Log resource usage
            logger.info(
                f"Endpoint: {request.url.path} | "
                f"Method: {request.method} | "
                f"Duration: {duration:.2f}s | "
                f"Memory: Start={start_memory:.1f}MB, End={end_memory:.1f}MB, "
                f"Peak={peak/1024/1024:.1f}MB"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in {request.url.path}: {str(e)}")
            raise
        finally:
            if tracemalloc.is_tracing():
                tracemalloc.stop()

# Keep the decorator for specific function monitoring if needed
def monitor_resources(func: Callable):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Start memory tracking
        tracemalloc.start()
        start_time = time.time()
        
        try:
            # Get initial measurements
            process = psutil.Process()
            start_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            # Execute the function
            result = await func(*args, **kwargs)
            
            # Get final measurements
            end_memory = process.memory_info().rss / 1024 / 1024
            duration = time.time() - start_time
            
            # Get memory peak
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            
            # Log resource usage
            logger.info(
                f"Function: {func.__name__} | "
                f"Duration: {duration:.2f}s | "
                f"Memory: Start={start_memory:.1f}MB, End={end_memory:.1f}MB, "
                f"Peak={peak/1024/1024:.1f}MB"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}")
            raise
        finally:
            if tracemalloc.is_tracing():
                tracemalloc.stop()
            
    return wrapper

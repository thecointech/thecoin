import logging
import sys
from pathlib import Path

def setup_logger(name: str = None) -> logging.Logger:
    """
    Set up and return a logger with consistent formatting and handlers.
    
    Args:
        name: Optional name for the logger. If None, returns the root logger
        
    Returns:
        A configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Only configure if it hasn't been configured before
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Console handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # Format with timestamp, level, and module name
        formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        
        # Optionally add file handler for persistent logs
        log_dir = Path(__file__).parent.parent / "logs"
        if not log_dir.exists():
            log_dir.mkdir(exist_ok=True)
            
        file_handler = logging.FileHandler(log_dir / "vqa_service.log")
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
    
    return logger

# Create a default logger for the application
app_logger = setup_logger("vqa_service")

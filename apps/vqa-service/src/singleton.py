from transformers import AutoModelForCausalLM, AutoProcessor, AutoConfig
import torch
import os
from pathlib import Path
from logger import setup_logger
import converted_model_path, MODEL_LOCAL_ONLY, MODEL_CACHE_DIR, MODEL_URL, MODEL_REVISION
logger = setup_logger(__name__)


# def _get_model_path():
#     # If MODEL_URL is set, use it (for cloud storage)
#     if MODEL_URL:
#         logger.info(f"Using model from URL: {MODEL_URL}")
#         return MODEL_URL

#     # Check local cache
#     logger.info(f"Checking for converted model in: {converted_model_path}")
#     if converted_model_path.exists() and (converted_model_path / "config.json").exists():
#         logger.info("Found converted model in cache")
#         return str(converted_model_path)

#     # Ensure cache directory exists
#     logger.info(f"No converted model found, using original model: {MODEL_NAME}")
#     os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
#     return MODEL_NAME

_processor = None
def get_processor():
    global _processor
    if _processor is None:
        logger.info("Loading processor...")
        _processor = AutoProcessor.from_pretrained(
            converted_model_path,
            trust_remote_code=False,
            device_map='auto',
            local_files_only=True
        )
        logger.info("Processor loaded successfully")
    return _processor

_model = None
def get_model():
    global _model
    if _model is None:
        # Load from converted path
        logger.info(f"Loading converted model from: {converted_model_path}")
        config = AutoConfig.from_pretrained(
            converted_model_path,
            trust_remote_code=False,
            local_files_only=True
        )
        _model = AutoModelForCausalLM.from_pretrained(
            converted_model_path,
            config=config,
            trust_remote_code=False,
            torch_dtype=torch.bfloat16,
            device_map='auto',
            local_files_only=True
        )
        logger.info("Converted model loaded successfully")

    return _model

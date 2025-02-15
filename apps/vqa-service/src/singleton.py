from transformers import AutoModelForCausalLM, AutoProcessor, AutoConfig
import torch
import os
from pathlib import Path
from logger import setup_logger

logger = setup_logger(__name__)

#
# Some thoughts on Molmo.
#
# Position can be quite far out with large pages (eg big, or with very skewed aspect ratios)
#
# Does very poorly with negative prompts (eg, "Ignore text with XYZ").  
# Positive prompts tend to do better: "Find the text without XYZ"
#

def get_project_root():
    """Get the project root by looking for key project files."""
    current = Path(__file__).resolve().parent
    while current.parent != current:
        if any((current / marker).exists() for marker in ['src']):
            return current
        current = current.parent
    return current

# Configuration for model paths
MODEL_NAME = 'allenai/Molmo-7B-D-0924'
MODEL_REVISION = '1721478b71306fb7dc671176d5c204dc7a4d27d7'
MODEL_CACHE_DIR = os.getenv('MODEL_CACHE_DIR', str(get_project_root() / '.model_cache'))
MODEL_URL = os.getenv('MODEL_URL', None)
MODEL_LOCAL_ONLY = os.getenv('MODEL_LOCAL_ONLY', False)

cache_path = Path(MODEL_CACHE_DIR)
converted_model_path = cache_path / "model_bfloat16"

def _get_model_path():
    # If MODEL_URL is set, use it (for cloud storage)
    if MODEL_URL:
        logger.info(f"Using model from URL: {MODEL_URL}")
        return MODEL_URL
    
    # Check local cache
    logger.info(f"Checking for converted model in: {converted_model_path}")
    if converted_model_path.exists() and (converted_model_path / "config.json").exists():
        logger.info("Found converted model in cache")
        return str(converted_model_path)
    
    # Ensure cache directory exists
    logger.info(f"No converted model found, using original model: {MODEL_NAME}")
    os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
    return MODEL_NAME

_processor = None
def get_processor():
    global _processor
    if _processor is None:
        logger.info("Loading processor...")
        _processor = AutoProcessor.from_pretrained(
            MODEL_NAME,
            revision=MODEL_REVISION,
            trust_remote_code=True,
            device_map='auto',
            cache_dir=MODEL_CACHE_DIR,
            local_files_only=MODEL_LOCAL_ONLY
        )
        logger.info("Processor loaded successfully")
    return _processor

_model = None
def get_model():
    global _model
    if _model is None:
        model_path = _get_model_path()
        
        # If using original model, load and convert
        if model_path == MODEL_NAME:
            logger.info("Loading model from original source...")
            _model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                revision=MODEL_REVISION,
                trust_remote_code=True,
                torch_dtype=torch.bfloat16,
                device_map='auto',
                cache_dir=MODEL_CACHE_DIR,
                local_files_only=MODEL_LOCAL_ONLY
            )
            logger.info("Converting model to bfloat16...")
            _model.to(dtype=torch.bfloat16)
            
            # Save the converted model with its config
            logger.info(f"Saving converted model to: {converted_model_path}")
            os.makedirs(converted_model_path, exist_ok=True)
            _model.save_pretrained(converted_model_path, safe_serialization=True, save_config=False)
            logger.info("Model converted and saved successfully")

        else:
            # Load from converted path
            logger.info(f"Loading converted model from: {model_path}")
            config = AutoConfig.from_pretrained(
                MODEL_NAME,
                revision=MODEL_REVISION,
                trust_remote_code=True,
                cache_dir=MODEL_CACHE_DIR,
                local_files_only=MODEL_LOCAL_ONLY
            )
            _model = AutoModelForCausalLM.from_pretrained(
                model_path,
                config=config,
                trust_remote_code=True,
                torch_dtype=torch.bfloat16,
                device_map='auto'
            )
            logger.info("Converted model loaded successfully")
    
    return _model

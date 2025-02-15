from transformers import AutoModelForCausalLM, AutoProcessor, AutoConfig
import torch
import os
from pathlib import Path

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
MODEL_CACHE_DIR = os.getenv('MODEL_CACHE_DIR', str(get_project_root() / '.model_cache'))
MODEL_URL = os.getenv('MODEL_URL', None)

cache_path = Path(MODEL_CACHE_DIR)
converted_model_path = cache_path / "model_bfloat16"

def _get_model_path():
    # If MODEL_URL is set, use it (for cloud storage)
    if MODEL_URL:
        return MODEL_URL
    
    # Check local cache
    if converted_model_path.exists() and (converted_model_path / "config.json").exists():
        return str(converted_model_path)
    
    # Ensure cache directory exists
    os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
    return MODEL_NAME

_processor = None
def get_processor():
    global _processor
    if _processor is None:
        _processor = AutoProcessor.from_pretrained(
            MODEL_NAME,
            trust_remote_code=True,
            device_map='auto',
            cache_dir=MODEL_CACHE_DIR
        )
    return _processor

_model = None
def get_model():
    global _model
    if _model is None:
        model_path = _get_model_path()
        
        # If using original model, load and convert
        if model_path == MODEL_NAME:
            _model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                trust_remote_code=True,
                torch_dtype=torch.bfloat16,
                device_map='auto',
                cache_dir=MODEL_CACHE_DIR
            )
            _model.to(dtype=torch.bfloat16)
            
            # Save the converted model with its config
            os.makedirs(converted_model_path, exist_ok=True)
            _model.save_pretrained(converted_model_path, safe_serialization=True, save_config=False)

        else:
            # Load from converted path but with original config
            config = AutoConfig.from_pretrained(
                MODEL_NAME,
                trust_remote_code=True,
                cache_dir=MODEL_CACHE_DIR
            )
            _model = AutoModelForCausalLM.from_pretrained(
                model_path,
                config=config,
                trust_remote_code=True,
                torch_dtype=torch.bfloat16,
                device_map='auto'
            )
    
    return _model

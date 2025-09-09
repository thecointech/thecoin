from transformers import AutoModelForCausalLM, AutoProcessor, AutoConfig
import torch
import os
import sys
from logger import setup_logger
from model_details import get_model_details
logger = setup_logger(__name__)

device_map = 'cuda'

# Check if running under debugger
is_debugging = sys.gettrace() is not None or 'pydevd' in sys.modules
# For whatever reason, we run out of GPU memory when running under debugger
if is_debugging:
    device_map = 'cpu'

_processor = None
def get_processor():
    global _processor
    if _processor is None:
        logger.info(f"Loading processor on device: {device_map}")
        details = get_model_details()
        _processor = AutoProcessor.from_pretrained(
            details.converted_model_path,
            trust_remote_code=True,
            device_map=device_map,
            local_files_only=True
        )
        logger.info("Processor loaded successfully")
    return _processor

_model = None
def get_model():
    global _model
    if _model is None:
        details = get_model_details()
        # Load from converted path
        logger.info(f"Loading converted model from: {details.converted_model_path}")
        config = AutoConfig.from_pretrained(
            details.converted_model_path,
            trust_remote_code=True,
            local_files_only=True
        )
        _model = AutoModelForCausalLM.from_pretrained(
            details.converted_model_path,
            config=config,
            trust_remote_code=True,
            torch_dtype=torch.bfloat16,
            device_map=device_map,
            local_files_only=True
        )
        logger.info("Converted model loaded successfully")

    return _model

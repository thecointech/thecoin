from transformers import AutoModelForCausalLM, AutoProcessor, AutoConfig
import torch
from logger import setup_logger
from model_details import get_model_details
logger = setup_logger(__name__)


_processor = None
def get_processor():
    global _processor
    if _processor is None:
        logger.info("Loading processor...")
        details = get_model_details()
        _processor = AutoProcessor.from_pretrained(
            details.converted_model_path,
            trust_remote_code=True,
            device_map='auto',
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
            device_map='auto',
            local_files_only=True
        )
        logger.info("Converted model loaded successfully")

    return _model

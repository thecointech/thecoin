
from transformers import AutoModelForCausalLM, AutoProcessor
import torch

_processor = None
def get_processor():
    global _processor
    if _processor is None:
        _processor = AutoProcessor.from_pretrained(
            'allenai/Molmo-7B-D-0924',
            trust_remote_code=True,
            torch_dtype=torch.bfloat16,
            device_map='auto'
        )
    return _processor

_model = None
def get_model():
    global _model
    if _model is None:
        _model = AutoModelForCausalLM.from_pretrained(
            'allenai/Molmo-7B-D-0924',
            trust_remote_code=True,
            torch_dtype=torch.bfloat16,
            device_map='auto'
        )
        _model.to(dtype=torch.bfloat16)

    return _model

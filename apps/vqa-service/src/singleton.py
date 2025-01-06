
from transformers import AutoModelForCausalLM, AutoProcessor
import torch

#
# Some thoughts on Molmo.
#
# Position can be quite far out with large pages (eg big, or with very skewed aspect ratios)
#
# Does very poorly with negative prompts (eg, "Ignore text with XYZ").  
# Positive prompts tend to do better: "Find the text without XYZ"
#
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

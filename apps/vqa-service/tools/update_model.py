
import os
import sys
from transformers import AutoModelForCausalLM
import glob
import shutil

# Add the src directory to the Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from model_details import MODEL_NAME, MODEL_CACHE_DIR, converted_model_path

def update_model():
    _model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        # revision=MODEL_REVISION,
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
        device_map='auto',
        cache_dir=MODEL_CACHE_DIR,
    )
    #print("Converting model to bfloat16...")
    _model.to(dtype=torch.bfloat16)

    # Save the converted model with its config
    #print(f"Saving converted model to: {converted_model_path}")
    os.makedirs(converted_model_path, exist_ok=True)
    _model.save_pretrained(converted_model_path, safe_serialization=True, save_config=False)

    # Copy all python dependencies to the converted model path
    #print("Copying dependencies to converted model path...")

    # Process Python files from snapshot directory
    for src in glob.glob(os.path.join(MODEL_CACHE_DIR, "*.py")):
        # Get the filename
        filename = os.path.basename(src)
        # Get the actual file that the symlink points to (if it's a symlink)
        actual_file = os.path.realpath(src)
        # Copy with the correct name
        shutil.copy2(actual_file, os.path.join("src/transformers_modules", filename))

    #print("Model converted and saved successfully")

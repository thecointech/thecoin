import os
import sys
import torch
from transformers import AutoModelForCausalLM
import glob
import shutil
from huggingface_hub import model_info
import re

# Add the src directory to the Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from model_details import MODEL_NAME, MODEL_CACHE_DIR, converted_model_path, get_project_root  # noqa: E402

def update_all():
    # clear_existing()

    # Get the current model version from hub
    info = model_info(MODEL_NAME)
    revision = info.sha
    print(f"Downloading {MODEL_NAME} at revision: {revision}")

    # update_model(revision)

    copy_additional_files(revision)

    # Update MODEL_REVISION
    save_version_number(revision)
    
    print("Model converted and saved successfully")

def clear_existing():
    # clear existing files
    print("Clearing existing files...")
    shutil.rmtree(converted_model_path, ignore_errors=True)
    os.makedirs(converted_model_path, exist_ok=True)

def update_model(revision: str):
    _model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        revision=revision,
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
        device_map='auto',
        cache_dir=MODEL_CACHE_DIR,
    )
    print("Converting model to bfloat16...")
    _model.to(dtype=torch.bfloat16)
    # Save the converted model with its config
    print(f"Saving converted model to: {converted_model_path}")
    os.makedirs(converted_model_path, exist_ok=True)
    _model.save_pretrained(converted_model_path, safe_serialization=True, save_config=False)

def copy_additional_files(revision: str):
    # Copy all python dependencies to the converted model path
    print("Copying dependencies to converted model path...")

    # Process Python files from snapshot directory
    model_folder =  "models--" + MODEL_NAME.replace("/", "--")
    version_folder = MODEL_CACHE_DIR / model_folder  / "snapshots" / revision
    if not version_folder.exists():
        raise Exception(f"Version {revision} not found in {MODEL_CACHE_DIR}")
        
    for src in glob.glob(os.path.join(version_folder, "*.*")):
        # Get the filename
        filename = os.path.basename(src)
        # Do not copy any file with model-{num}-of-{num} in its name
        tensor_file = re.match("model-\\d+-of-\\d+", filename)
        if tensor_file:
            print(f"Skipping tensor file: {filename}")
            continue
        if filename == "merges.text":
            print(f"Skipping merges file: {filename}")
            continue
        # Don't copy any that already exist
        if (converted_model_path / filename).exists():
            print(f"Skipping existing file: {filename}")
            continue

        # Get the actual file that the symlink points to (if it's a symlink)
        actual_file = os.path.realpath(src)
        # Copy with the correct name
        shutil.copy2(actual_file, converted_model_path / filename)

def save_version_number(revision: str):
    with open(get_project_root() / "src" / "model_details_version.py", "w", encoding="utf-8") as f:
        f.write(f"MODEL_REVISION = '{revision}'")




if __name__ == "__main__":
    update_all()
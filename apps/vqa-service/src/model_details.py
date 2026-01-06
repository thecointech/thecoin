

import os
from pathlib import Path
from logger import setup_logger
from model_details_version import MODEL_REVISION
from dataclasses import dataclass, astuple

# # export MODEL_VERSION
# MODEL_REVISION = MODEL_REVISION

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

# this doesn't need to be a singleton, this
# is simply to prevent it from logging on import
@dataclass
class ModelDetails:
    MODEL_NAME: str
    MODEL_REVISION: str
    MODEL_CACHE_DIR: Path
    converted_model_path: Path

    def __iter__(self):
        return iter(astuple(self))

_details = None
def get_model_details():
    global _details
    if _details is None:
        # Configuration for model paths
        MODEL_NAME = 'allenai/Molmo-7B-D-0924'
        MODEL_CACHE_DIR = Path(os.getenv('MODEL_CACHE_DIR', str(get_project_root() / '.model_cache')))
        # MODEL_URL = os.getenv('MODEL_URL', None)
        # MODEL_LOCAL_ONLY = os.getenv('MODEL_LOCAL_ONLY', "False") != "False"

        cache_path = Path(MODEL_CACHE_DIR)
        converted_model_path = cache_path / "model_bfloat16"

        logger.info("Intialized Model params: ")
        logger.info(f"  - MODEL_NAME: {MODEL_NAME}")
        logger.info(f"  - MODEL_REVISION: {MODEL_REVISION}")
        logger.info(f"  - MODEL_CACHE_DIR: {MODEL_CACHE_DIR}")
        # logger.info(f"  - MODEL_URL: {MODEL_URL}")
        # logger.info(f"  - MODEL_LOCAL_ONLY: {MODEL_LOCAL_ONLY}")

        _details = ModelDetails(
            MODEL_NAME,
            MODEL_REVISION,
            MODEL_CACHE_DIR,
            converted_model_path
        )
    return _details

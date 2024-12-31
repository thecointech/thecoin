import json
import os
from PIL import Image
from typing import NamedTuple
from dotenv import load_dotenv

load_dotenv()

class TestData(NamedTuple):
    image: Image.Image
    original: dict


def get_image_and_json(image_file: str, json_type: str):
    with Image.open(image_file) as image:
        image.load()
    json_file = image_file.replace(".png", f"-{json_type}.json")
    if (json_type):
        try:
            with open(json_file, "rb") as f:
                json_data = json.load(f)
            return TestData(image, json_data)
        except Exception:
            pass  # means it's not there, which... is fine
    return TestData(image, None)
    # TEST - Do coords work better if cropped?


def get_basename(image_file: str):
    return os.path.basename(image_file).split(".")[0]


def get_test_data(page_type: str, json_type=None) -> dict[str, TestData]:
    # get the private testing folder from the environment
    test_folder = os.environ.get("PRIVATE_TESTING_PAGES", None)
    if test_folder is None:
        return []

    # list all files in the folder
    samples_folder = os.path.join(test_folder, "unit-tests", page_type)
    image_files = [
        os.path.join(samples_folder, f)
        for f in os.listdir(samples_folder)
        if f.endswith(".png")
    ]

    # return a dictionary where the key is the basename and the value is image & json dataa
    return {get_basename(f): get_image_and_json(f, json_type) for f in image_files}

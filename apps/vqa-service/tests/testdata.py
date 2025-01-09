import json
import os
from PIL import Image
from typing import NamedTuple, TypedDict
from dotenv import load_dotenv

load_dotenv()

# TODO: Make this configurable?  A larger LLM may be able to handle bigger images
MAX_HEIGHT = 770 #1440

class JsonDatum(TypedDict):
    name: str
    data: object

class TestData(NamedTuple):
    key: str
    image: Image.Image
    elements: JsonDatum
    # page_type: str

class SingleTestDatum(NamedTuple):
    key: str
    image: Image.Image
    element: object
    # page_type: str
    # element_type: str

def load_json(json_file: str):
    try:
        with open(json_file, "rb") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def get_elements(image_file: str):
    image_folder = os.path.dirname(image_file)
    base_name = get_basename(image_file)
    json_paths = [
        os.path.join(image_folder, f)
        for f in os.listdir(image_folder)
        if f.endswith(".json") and f.startswith(base_name)
    ]
    return {get_element_type(f): load_json(f) for f in json_paths}


def load_image(image_file: str, max_height: int = MAX_HEIGHT):
    with Image.open(image_file) as image:
        # NOTE: Position detection works better if image is cropped
        # However it's not always true that the element being searched
        # is above the fold, so we may need to create a tiling search approach
        image.load()

    if (image.height > max_height):
        image = image.crop((0, 0, image.width, max_height))

    return image


def get_basename(image_file: str):
    return os.path.basename(image_file).split(".")[0]


def get_element_type(json_file: str):
    parts = get_basename(json_file).split("-")
    return "-".join(parts[1:])


def get_test_data(test_type: str, page_type: str, max_height: int = MAX_HEIGHT) -> dict[str, TestData]:
    # get the private testing folder from the environment
    test_folder = os.environ.get("PRIVATE_TESTING_PAGES", None)
    if test_folder is None:
        return []

    # list all files in the folder
    samples_folder = os.path.join(test_folder, "unit-tests", test_type, page_type)
    image_files = [
        os.path.join(samples_folder, f)
        for f in os.listdir(samples_folder)
        if f.endswith(".png")
    ]

    # elements = {f: get_elements(f) for f in image_files}
    # only_valid = {k: v for k, v in elements.items() if v is not None}
    return [TestData(get_basename(f), load_image(f, max_height), get_elements(f)) for f in image_files]


def get_single_test_element(test_type: str, page_type: str, data_type: str, max_height: int = MAX_HEIGHT):
    all_data = get_test_data(test_type, page_type, max_height)
    return [SingleTestDatum(v.key, v.image, v.elements[data_type]) for v in all_data if data_type in v.elements]


# Doesn't belong here, perhaps need utils file
def get_extra(obj, *path, default=None):
    return get_nested(obj, *("extra", *path), default=default)

def get_nested(obj, *path, default=None):
    if len(path) == 0:
        return obj or default

    if path[0] in obj:
        return get_nested(obj[path[0]], *path[1:], default=default)

    return default
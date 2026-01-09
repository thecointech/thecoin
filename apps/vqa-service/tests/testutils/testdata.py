import json
import os
import glob
import re
from PIL import Image
from typing import NamedTuple, List, Dict, Any, Optional, Iterator
from typing_extensions import TypedDict
from dataclasses import dataclass
from dotenv import load_dotenv
from pathlib import Path

from fastapi import UploadFile
import io

from .overrides import OverrideData, SkipElement, apply_overrides, get_override_data

load_dotenv()

# TODO: Make this configurable?  A larger LLM may be able to handle bigger images
MAX_HEIGHT = 1440

@dataclass
class VqaCallData:
    args: List[Any]
    response: Dict[str, Any]

class Coords(TypedDict):
    top: float
    left: float
    centerY: float
    height: float
    width: float

class FontData(TypedDict):
    font: str
    color: str
    size: str
    style: str

class ElementData(TypedDict):
    tagName: str
    role: Optional[str]
    selector: str
    coords: Coords
    font: FontData
    label: str
    text: str
    nodeValue: str
    parentSelector: str
    parentTagName: str
    siblingText: List[str]

class ComponentsData(TypedDict):
    selector: float
    tag: float
    inputType: float
    font: float
    label: float
    role: float
    positionAndSize: float
    nodeValue: float
    siblings: float
    estimatedText: float

class TestElmRawData(TypedDict):
    data: ElementData
    score: float
    components: ComponentsData

@dataclass
class TestElmData:
    filename: str
    data: ElementData
    score: float
    components: ComponentsData

class TestSchData(TypedDict):
    score: float
    components: Any
    search: Dict[str, Any]

class ElementName(TypedDict):
    step: int
    index: int
    name: str
    fullname: str

class TestData:
    def __init__(self, key: str, target: str, step: str,
                 matched_folder: str, json_files: List[str], override_data: Optional[OverrideData] = None):
        self.key = key
        self.target = target
        self.step = step
        self._matched_folder = matched_folder
        self._json_files = json_files
        self._override_data: OverrideData = override_data or {}

    def __str__(self) -> str:
        return self.key

    @property
    def elm_files(self):
      return [f for f in self._json_files if f.endswith("-elm.json")]

    @property
    def vqa_files(self):
      return [f for f in self._json_files if f.endswith("-vqa.json")]

    @property
    def elements(self) -> List[ElementName]:
        """
        Returns a list of all matching elements in the test data folder.
        Each element is a dict with the following keys:
        - step: the step number
        - index: the element index
        - name: the element name
        - fullname: the full name of the element
        """
        return [
            {
                "step": int(match.group(1)),
                "index": int(match.group(2)),
                "name": match.group(3),
                "fullname": f"{match.group(1)}-{match.group(2)}-{match.group(3)}",
            }
            for f in self.elm_files
            if (match := re.match(r"(\d+)-(\d+)-(.+)-elm\.json", f))
        ]

    @property
    def html(self):
      html_file = os.path.join(self._matched_folder, self.step + ".mhtml")
      try:
        with open(html_file, "r") as f:
          return f.read()
      except:
        return None

    @property
    def html_location(self):
        return self._extract_html_header(r"^Content-Location:\s*(.*)$")

    @property
    def html_title(self):
        return self._extract_html_header(r"^Subject:\s*(.*)$")

    @property
    def image(self) -> UploadFile:
      image_path = os.path.join(self._matched_folder, self.step + ".png")

      # Read the image file as bytes
      with open(image_path, 'rb') as f:
        image_bytes = f.read()

      # Create a BytesIO object from the image bytes
      image_buffer = io.BytesIO(image_bytes)

      # Create and return UploadFile
      return UploadFile(
          filename=f"{self.step}.png",
          file=image_buffer
      )

    def has_element(self, element: str):
      return any([True for e in self.elm_files if element in e])

    def has_vqa(self, vqa: str):
      return any([True for v in self.vqa_files if vqa in v])

    def vqa(self, call: str) -> VqaCallData:
        """Get the first VQA call data for a specific call name"""
        matching_files = [f for f in self.vqa_files if call in f]
        if matching_files:
            file_path = os.path.join(self._matched_folder, matching_files[0])
            with open(file_path, 'r') as f:
                data = json.load(f)
                return VqaCallData(args=data.get('args', []), response=data.get('response', data))
        raise ValueError(f"No VQA call data found for {call}")

    def elm(self, element: str) -> TestElmData:
        """Get the first element data for a specific element name"""
        matching_files = [f for f in self.elm_files if element in f]
        if not matching_files:
            raise FileNotFoundError(f"No element file found for '{element}' in {self.key}")

        filename = os.path.join(self._matched_folder, matching_files[0])
        return self._get_elm_data(filename)

    def sch(self, name: str, idx: int = 0) -> TestSchData:
        """Get the first element data for a specific element name"""
        matching_files = [f for f in self._json_files if name in f and f.endswith("-sch.json")]
        if matching_files:
            file_path = os.path.join(self._matched_folder, matching_files[idx])
            with open(file_path, 'r') as f:
                data = json.load(f)
                return TestSchData(score=data.get('score', 0.0), components=data.get('components', {}), search=data.get('search', {}))
        raise ValueError(f"No element data found for {name}")

    def vqa_iter(self, call: str):
        """Get an iterator over all VQA call data for a specific call name"""
        matching_files = [f for f in self._json_files if call in f and f.endswith("-vqa.json")]
        for filename in matching_files:
            file_path = os.path.join(self._matched_folder, filename)
            with open(file_path, 'r') as f:
                data = json.load(f)
                yield VqaCallData(args=data.get('args', []), response=data.get('response', data))

    def elm_iter(self, name: str):
        """Get an iterator over all element data for a specific element name"""
        matching_files = [f for f in self.elm_files if name in f]
        for filename in matching_files:
            yield self._get_elm_data(os.path.join(self._matched_folder, filename))

    def _extract_html_header(self, pattern: str) -> Optional[str]:
        """Extract a header value from HTML using the given regex pattern"""
        if not self.html:
            return None
        match = re.search(pattern, self.html, re.MULTILINE | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None

    def _get_elm_data(self, filename: str) -> TestElmData:
        elementName = os.path.basename(filename).split("-elm.json")[0]
        data: TestElmRawData = get_json_data(filename)
        apply_overrides(self._override_data, self.key, elementName, data)
        return TestElmData(filename, **data)

def get_json_data(filename: str) -> Any:
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)


def _get_json_files(matched_folder: str, step: str, skip: Optional[SkipElement] = None) -> List[str]:
    """Get JSON files for a test, filtering out skipped elements"""
    all_files = os.listdir(matched_folder)
    json_files = [f for f in all_files if f.startswith(step)]

    if skip:
        # Filter out files that contain any of the skipped element names
        skip_elements = skip.get('elements')
        if skip_elements:
            json_files = [f for f in json_files
                         if not any(elem in f for elem in skip_elements)]

    return json_files

def get_test_data(section: str, search_pattern: str="*", record_time: str = 'latest') -> List[TestData]:
    """
    Get test data matching the specified section and search pattern.

    Args:
        section: The section to search in (e.g., "AccountsSummary")
        search_pattern: Pattern to match in filenames
        record_time: Time folder to search in (default: 'latest')

    Returns:
        List of TestData objects
    """
    test_folder = os.environ['PRIVATE_TESTING_PAGES']
    base_folder = os.path.join(test_folder, record_time)
    override_data = get_override_data(test_folder)
    results: List[TestData] = []

    patterns = [search_pattern]
    if (search_pattern.startswith("{") and search_pattern.endswith("}")):
        cleaned = search_pattern[1:-1]
        patterns = cleaned.split(",")

    allMatched = []
    for pattern in patterns:
        pattern = os.path.join(base_folder, "**", section, "**", f"*{pattern}*")
        matched = glob.glob(pattern, recursive=True)
        allMatched.extend(matched)

    for match in allMatched:
        matched_folder = os.path.dirname(match)
        matched_filename = os.path.basename(match)
        step = matched_filename.split('-')[0]
        key = f"{os.path.relpath(matched_folder, test_folder)}-{step}"

        # Skip if we already have this key
        if any(r.key == key for r in results):
            continue

        # Check if this test should be skipped
        skip = override_data.get('skip', {}).get(key)
        if skip and not skip.get('elements'):
            # Skip entire test if no specific elements are specified
            continue

        # Check if PNG file exists (required for valid test)
        if not os.path.exists(os.path.join(matched_folder, f"{step}.png")):
            continue

        # Get JSON files, filtering out skipped elements
        json_files = _get_json_files(matched_folder, step, skip)
        if not json_files:
            continue

        # Extract target from path
        path_bits = matched_folder.split(os.sep)
        path_bits.reverse()
        target = path_bits[2] if path_bits[1] == section else path_bits[1]

        results.append(TestData(key, target, step, matched_folder, json_files, override_data))

    return results

# Example usage:
if __name__ == "__main__":
    # Test the function
    test_data = get_test_data("AccountsSummary", "balance", "archive/2025-07-25_15-16")
    for test in test_data:
        print(f"Test: {test}")
        vqa_data = test.vqa("balance")
        if vqa_data:
            print(f"  VQA Response: {vqa_data.response}")
        elm_data = test.elm("account")
        if elm_data:
            print(f"  Element Data: {elm_data}")

############# Old Code Below ##################3


class ElementDatum(NamedTuple):
    vqa: object
    elm: object

# class TestData(NamedTuple):
#     # The index is the index of the step in the bank/intent/*.png list
#     index: str
#     # Source is generally the name of the bank
#     source: str
#     # What part of the agent flow this is?
#     intent: str
#     # loaded image
#     image: Image.Image
#     # loaded html
#     html: str
#     # Any associated json vqa/element data
#     elements: dict[str, ElementDatum]

#     @property
#     def key(self):
#         return f"{self.source}-{self.intent}-{self.index}"

#     @property
#     def html_location(self):
#         match = re.search(r"^Content-Location:\s*(.*)$", self.html, re.MULTILINE | re.IGNORECASE)
#         if match:
#             return match.group(1).strip()
#         return None

#     @property
#     def html_title(self):
#         match = re.search(r"^Subject:\s*(.*)$", self.html, re.MULTILINE | re.IGNORECASE)
#         if match:
#             return match.group(1).strip()
#         return None

# class SampleData(NamedTuple):
#     key: str
#     path: Path # Path to the folder containing image and json
#     image: Image.Image
#     elements: dict[str, ElementDatum]
#     parent_coords: list[BBox]
#     gold: list[str]
#     raw: list[str] = None

class SingleTestData(NamedTuple):
    key: str
    image: Image.Image
    element: ElementDatum
    html_title: str
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
    elements = {}
    for path in json_paths:
        filename = os.path.basename(path)
        (element, src) = get_element_type(filename)
        if src:
          if element not in elements:
              elements[element] = ElementDatum(vqa=None, elm=None)
          elements[element] = elements[element]._replace(**{src: load_json(path)})
    return elements



def load_image(image_file: str, max_height: int = MAX_HEIGHT):
    with Image.open(image_file) as image:
        # NOTE: Position detection works better if image is cropped
        # However it's not always true that the element being searched
        # is above the fold, so we may need to create a tiling search approach
        image.load()

    if (image.height > max_height):
        image = image.crop((0, 0, image.width, max_height))

    return image

def load_html(image_file: str):
    html_file = image_file.replace(".png", ".mhtml")
    with open(html_file, "r") as f:
        return f.read()

def get_basename(image_file: str):
    return os.path.basename(image_file).split(".")[0]

# Our format is /<source>/<intent>/<step>.png
def get_source(image_file: str):
    return os.path.dirname(image_file).split("/")[0]

def get_intent(image_file: str):
    return os.path.dirname(image_file).split("/")[1]

def get_element_type(json_file: str):
    basename = get_basename(json_file)
    parts = basename.split("-")
    src = parts[-1]
    if (src == "elm" or src == "vqa"):
        return ("-".join(parts[1:-1]), src)
    return (None, None)


# Only run tests with this key
KeyFilter = []
KeyFilter = ["Tangerine"]

#
# This code duplicates getTestData.ts
#
# def get_test_data(intent_filter: str|list[str], max_height: int = MAX_HEIGHT) -> list[TestData]:
#     # get the private testing folder from the environment
#     test_folder = os.environ.get("PRIVATE_TESTING_PAGES", None)
#     if test_folder is None:
#         return []

#     record_base = os.path.join(test_folder, "latest")
#     # Find all png files that have test_filter in their path somewhere
#     image_files = glob.glob(f"**/{intent_filter}/**/*.png", root_dir=record_base, recursive=True)

#     test_data = [
#         TestData(
#             get_basename(f),
#             get_source(f),
#             get_intent(f),
#             load_image(os.path.join(record_base, f), max_height),
#             load_html(os.path.join(record_base, f)),
#             get_elements(os.path.join(record_base, f))
#         ) for f in image_files]

#     # In DEBUG mode, allow filtering only to a single key
#     # this allows us to focus on a single target
#     if (os.environ.get('DEBUGPY_RUNNING') == "true" and len(KeyFilter) > 0):
#         test_data = [v for v in test_data if v.key in KeyFilter]
#     elif len(test_data) == 0:
#         raise Exception("No test data found for intent filter: " + intent_filter)
#     return test_data


# def get_single_test_element(filter: str, data_type: str, max_height: int = MAX_HEIGHT) -> list[SingleTestData]:
#     all_data = get_test_data(filter, max_height)
#     single = [SingleTestData(v.key, v.image, v.elements[data_type], v.html_title) for v in all_data if data_type in v.elements]
#     if len(single) == 0:
#         raise Exception("No single test data found for intent filter: " + filter + " and data type: " + data_type)
#     return single


# Doesn't belong here, perhaps need utils file
def get_extra(obj, *path, default=None):
    return get_nested(obj, *("extra", *path), default=default)

def get_nested(obj, *path, default=None):
    if len(path) == 0:
        return obj or default

    if path[0] in obj:
        return get_nested(obj[path[0]], *path[1:], default=default)

    return default

#
# TODO: Deduplicate this with get_test_data
#

def get_private_folder(base_type: str, test_type: str|None = None) -> Path|None:
    base_folder = os.environ.get("PRIVATE_TESTING_PAGES", None)
    if base_folder is None:
        return None

    args = [base_folder, base_type]
    if test_type is not None:
        args.append(test_type)
    return Path(*args)

# def get_sample_data(test_type: str) -> dict[str, TestData]:
#     # get the private testing folder from the environment
#     samples_folder = get_private_folder("samples", test_type)
#     if samples_folder is None:
#         return []

#     # list all files in the folder
#     targets = [dir for dir in samples_folder.iterdir() if dir.is_dir()]
#     sample_data = {}
#     for target in targets:
#         image_files = [
#             os.path.join(target.absolute(), f)
#             for f in target.iterdir()
#             if f.name.endswith(".png")
#         ]

#         images = [load_image(f) for f in image_files]
#         elements = [get_elements(f) for f in image_files]

#         inputs = [e['page-inputs'] for e in elements]
#         gold = [e['page-gold']['inputs'] for e in elements]
#         raw = [e['page-raw']['inputs'] if 'page-raw' in e else None for e in elements]

#         elements = [i["elements"] for i in inputs]
#         parent_coords = [i["parentCoords"] for i in inputs]

#         samples = [
#             SampleData(idx + 1, target, image, elements, [BBox.from_coords(coord) for coord in parent_coords], gold, raw)
#             for idx, (image, elements, parent_coords, gold, raw) in enumerate(zip(images, elements, parent_coords, gold, raw))
#         ]
#         sample_data[target.name] = samples

#     return sample_data

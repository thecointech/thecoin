import json
import os
import re
from typing import List, Any, Optional
from dotenv import load_dotenv

from fastapi import UploadFile
import io

from tests.testutils.types import ElementName, TestElmData, TestElmRawData, TestSchData, VqaCallData

from .overrides import OverrideData, SkipElement, apply_overrides

load_dotenv()

# TODO: Make this configurable?  A larger LLM may be able to handle bigger images
MAX_HEIGHT = 1440
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



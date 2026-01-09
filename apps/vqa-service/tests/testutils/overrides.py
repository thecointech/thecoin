import json
import os
from typing import Dict, List, Optional, TypedDict, Any


class OverrideElement(TypedDict, total=False):
    text: Optional[str]
    selector: Optional[str]
    coords: Optional[Dict[str, float]]

class SkipElement(TypedDict, total=False):
    reason: Optional[str]
    elements: Optional[List[str]]

class OverrideData(TypedDict, total=False):
    skip: Optional[Dict[str, SkipElement]]
    overrides: Optional[Dict[str, Dict[str, OverrideElement]]]

def get_override_data(test_folder: str) -> OverrideData:
    """Load override data from overrides.json file"""
    override_file = os.path.join(test_folder, "archive", "overrides.json")
    if os.path.exists(override_file):
        with open(override_file, 'r') as f:
            return json.load(f)
    return {}

def apply_overrides(overrideData: OverrideData, key: str, element_name: str, element_data: TypedDict):
    """Apply overrides to element data if they exist"""
    if not overrideData or 'overrides' not in overrideData:
        return
    override_dict = overrideData['overrides']
    if override_dict is None:
        return
    overrides = override_dict.get(key)
    if overrides:
        element_override = overrides.get(element_name)
        if element_override:
            for key in element_override:
                element_data[key] = element_override[key]

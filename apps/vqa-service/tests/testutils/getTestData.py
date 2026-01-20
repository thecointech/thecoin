import os
from .overrides import SkipElement, get_override_data
from .testdata import TestData
from typing import List, Optional
import glob

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
    override_skip = override_data.get('skip') or {}
    results: List[TestData] = []

    patterns = [search_pattern]
    if (search_pattern.startswith("{") and search_pattern.endswith("}")):
        cleaned = search_pattern[1:-1]
        patterns = cleaned.split(",")

    all_matched = []
    for pattern in patterns:
        pattern = os.path.join(base_folder, "**", section, "**", f"*{pattern}*")
        matched = glob.glob(pattern, recursive=True)
        all_matched.extend(matched)

    for match in all_matched:
        matched_folder = os.path.dirname(match)
        matched_filename = os.path.basename(match)
        step = matched_filename.split('-')[0]
        key = f"{os.path.relpath(matched_folder, test_folder).replace(os.sep, ':')}:{step}"

        # Skip if we already have this key
        if any(r.key == key for r in results):
            continue

        # Check if this test should be skipped
        skip = override_skip.get(key)
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

def _get_json_files(matched_folder: str, step: str, skip: Optional[SkipElement] = None) -> List[str]:
    """Get JSON files for a test, filtering out skipped elements"""
    all_files = os.listdir(matched_folder)
    json_files = [f for f in all_files if f.startswith(step) and f.endswith(".json")]

    if skip:
        # Filter out files that contain any of the skipped element names
        skip_elements = skip.get('elements')
        if skip_elements:
            json_files = [f for f in json_files
                         if not any(elem in f for elem in skip_elements)]

    return json_files

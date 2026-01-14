import json
from typing import Any, Awaitable, Callable
import unittest
import os
import sys
import re
from dateparser import parse
from fastapi import UploadFile

from tests.testutils.getTestData import get_test_data
from tests.testutils.testdata import TestData
from tests.testutils.types import ElementData, TestElmData, VqaCallData

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from data_elements import DateElementResponse, ElementResponse, PositionResponse

class TestBase(unittest.IsolatedAsyncioTestCase):

    section: str
    record_time: str = 'latest'

    def assertEqual(self, str1: object, str2: object, msg: str|None = None):
        # Ignore all case/space differences
        if (isinstance(str1, str) and isinstance(str2, str)):
            super().assertEqual(normalize(str1), normalize(str2), msg)
        else:
            super().assertEqual(str1, str2, msg)

    def assertPosition(self, response: PositionResponse, expected: ElementData, get_vqa: Callable[[], VqaCallData]|None=None, tolerance: int|None=None):
        o_width = expected["coords"]["width"]
        o_height = expected["coords"]["height"]
        o_left = expected["coords"]["left"]
        o_top = expected["coords"]["top"]
        o_centerX = o_left + o_width / 2
        o_centerY = o_top + o_height / 2

        # Access position attributes directly from Pydantic object
        e_posX = response.position_x
        e_posY = response.position_y

        if tolerance is None:
            tolerance = 5
        try:
            self.assertAlmostEqual(
                e_posX,
                o_centerX,
                delta=max(20, tolerance + o_width * 0.6),
                msg=f"X: {e_posX} does not match expected: {o_centerX} with width: {o_width}"
            )
            self.assertAlmostEqual(
                e_posY,
                o_centerY,
                delta=max(20, tolerance + o_height * 0.6),
                msg=f"Y: {e_posY} does not match expected: {o_centerY} with height: {o_height}"
            )
        except AssertionError as e:
            if get_vqa is not None:
                original = get_vqa()
                self.assertAlmostEqual(
                    e_posX,
                    original.response['position_x'],
                    delta=o_width * 0.01,
                    msg=f"X: {original.response['position_x']} does not match original: {e_posX}"
                )
                self.assertAlmostEqual(
                    e_posY,
                    original.response['position_y'],
                    delta=o_height * 0.01,
                    msg=f"Y: {original.response['position_y']} does not match original: {e_posY}"
                )
            else:
                raise e

    def get_expected_text(self, expected: ElementData):
        expected_content = expected.get('text', expected.get('label', ''))
        return normalize(expected_content)

    def get_response_text(self, response):
        # Handle both dict and Pydantic object responses
        if not hasattr(response, 'content') and not hasattr(response, 'placeholder_text'):
            return None
        response_content = getattr(response, 'content', None)
        if response_content is None:
            response_content = getattr(response, 'placeholder_text', '')
        return normalize(response_content)

    def assertContent(self, response: ElementResponse, expected: ElementData):

        response_text = self.get_response_text(response)
        if (response_text is None):
            return

        expected_content = self.get_expected_text(expected)

        # We can't reliably check this, the actual scraped may result in
        # elements that contain text visually but are not children in the DOM
        # For example, inputs with labels etc
        # if (expected["text"] == ""):
        #     # If no text expected, then response should be empty
        #     self.assertEqual(response["content"], "", "Text: " + response["content"] + " does not match expected: " + expected["text"] + " in " + key)
        # else:
        # Else, just check they overlap in some way
        textOverlap = (
            expected_content in response_text or
            response_text in expected_content
        )
        # Allow a single character substitution
        if not textOverlap and len(expected_content) == len(response_text) and len(expected_content) > 5:
            # Check for a single character difference
            diff = 0
            for i in range(len(expected_content)):
                if expected_content[i] != response_text[i]:
                    diff += 1
            if diff == 1:
                textOverlap = True

        self.assertTrue(textOverlap, f"Text: {response_text} does not match expected: {expected_content}")

    def assertNeighbours(self, response: ElementResponse, expected: ElementData):
        # siblingText is quite restrictive, so it may not have any values
        # if it does, then there should be a match (except in Scotiabank)
        o_neigbours = [normalize(s) for s in expected["siblingText"]]
        if (normalize(response.neighbour_text) in o_neigbours):
            # This can be wrong because it might pick up neighbours above/below
            # so just reassure ourselves when we do get it right :-)
            # test.assertIn(normalize(response["neighbour_text"]), o_neigbours)
            print("Found: " + normalize(response.neighbour_text) + " in " + str(o_neigbours))

    # The LLM seems to return the date in a different format from
    # whats on the page.  The scraper can handle the difference, so
    # we just check that the dates match, and the format is not important
    def assertDate(self, response: DateElementResponse, expected: ElementData):
        responseDate = parse(response.content)
        expectedDate = parse(expected["text"])
        self.assertEqual(responseDate, expectedDate, f"Date: {responseDate} does not match expected: {expectedDate}")

    # def assertResponse_old(self, response: ElementResponse, expected: TestElmData|None, original: str|None=None, tolerance:int=5):
    #     self.assertIsNotNone(expected)
    #     assert expected is not None  # Type narrowing for mypy/pylsp
    #     # if "coords" in expected.data:
    #         # self.assertPosition(response, expected.data, original, tolerance)
    #     self.assertContent(response, expected.data)
    #     self.assertNeighbours(response, expected.data)
    #     print("Element Found Correctly")

    def assertResponse(self, response: PositionResponse, test: TestData, element: str, vqa: str|Callable[[], VqaCallData]|None=None, tolerance:int|None=None):
        expected = test.elm(element)
        self.assertIsNotNone(expected)
        if "coords" in expected.data:
            vqa_fn = vqa if isinstance(vqa, Callable) else lambda: test.vqa(vqa or "VQA Not Provided for " + element)
            self.assertPosition(response, expected.data, vqa_fn, tolerance)
        if isinstance(response, ElementResponse):
            self.assertContent(response, expected.data)
            self.assertNeighbours(response, expected.data)
        print("Element Found Correctly")

    def assertDateResponse(self, response: DateElementResponse, expected: TestElmData|None):
        self.assertIsNotNone(expected)
        assert expected is not None  # Type narrowing for mypy/pylsp
        self.assertDate(response, expected.data)
        self.assertPosition(response, expected.data)
        self.assertNeighbours(response, expected.data)
        print("Element Found Correctly")

    # Processing the larger screenshot can result in errors reading small text.
    # This function will focus in on the area containing the elements (vertically only)
    def getCropFromElements(self, image, elements, buffer=200):
        all_posY = [el["coords"]["centerY"] for el in elements]
        max_posY = round(max(all_posY))
        min_posY = round(min(all_posY))
        return (max(min_posY - buffer, 0), min(max_posY + buffer, image.height))

    # def test_element_type(self, element_type: str, endpoint: Callable[[UploadFile], Awaitable[ElementResponse]], tolerance=5):
    #     tests = get_test_data("TwoFA", element_type, "archive")
    #     for test in tests:
    #         with base.subTest(key=test.key):
    #             response = await endpoint(test.image())
    #             elm = test.elm(element_type)
    #             base.assertResponse(response, elm, tolerance)

    async def run_subtests(self, test_func, search_pattern: str="*", skip_if: None|Callable[[TestData], bool] = lambda test: False):
        test_datum = get_test_data(self.section, search_pattern, self.record_time)
        failing_tests = []
        for test in test_datum:
            with self.subTest(key=test.key):
                if skip_if and skip_if(test):
                    self.skipTest(f"Skipping {test.key}")
                try:
                    await test_func(test)
                except Exception as e:
                    failing_tests.append(test.key)
                    raise e

        if len(failing_tests) > 0:
            print("Failing tests: " + str(failing_tests))
        return failing_tests

    async def verify_elements(
        self,
        element: str,
        vqa: str|None=None,
        search_pattern: str|None=None,
        endpoint: Callable[[UploadFile], Awaitable[PositionResponse]]|None=None,
        test_func: Callable[[TestData], Awaitable[None]]|None=None,
        skip_if: list[str]|Callable[[TestData], bool] = [],
        tolerance: int|None = None
    ):
        test_datum = get_test_data(self.section, search_pattern or element, self.record_time)
        test_name = endpoint.__name__ if endpoint else test_func.__name__ if test_func else element
        failing_tests: list[str] = []
        skip_filter = self.get_skip_filter(test_name, skip_if)
        for test in test_datum:
            with self.subTest(key=test.key):
                if skip_filter and skip_filter(test):
                    self.skipTest(f"Skipping {test.key}")
                    # execution does not return
                try:
                    if endpoint:
                        response = await endpoint(test.image)
                        self.assertResponse(response, test, element, vqa, tolerance=tolerance)
                    elif test_func:
                        await test_func(test)
                    else:
                        raise ValueError("No endpoint_func or test_func provided")

                except Exception as e:
                    failing_tests.append(test.key)
                    raise e

        if len(failing_tests) > 0:
            # write failing to disk as JSON
            with open(self.failing_name(test_name), "w") as f:
                json.dump(failing_tests, f)
            print("Failing tests: " + str(failing_tests))
        else:
            # delete the file if it exists
            if os.path.exists(self.failing_name(test_name)):
                os.remove(self.failing_name(test_name))

        return failing_tests

    def failing_name(self, name: str):
        return f"failing-vqa-{self.section}-{name}.json"

    def get_skip_filter(self, name: str, skip_if: list[str]|Callable[[TestData], bool]):
        skip_fn = skip_if if isinstance(skip_if, Callable) else lambda test: test.key in skip_if
        if (not os.path.exists(self.failing_name(name))):
            return skip_fn
        is_debugging = sys.gettrace() is not None or 'pydevd' in sys.modules
        if not is_debugging:
            return skip_fn
        # if debugging, only run the failing tests
        with open(self.failing_name(name), "r") as f:
            data = json.load(f)
            return lambda test: skip_fn(test) or test.key not in data

def get_member(obj, key):
    if hasattr(obj, key):
        return getattr(obj, key)
    elif isinstance(obj, dict) and key in obj:
        return obj[key]
    return None

def normalize(str: str):
    str = str.lower()
    str = re.sub(r'[$.,-\/\s]', '', str)  # login == log in (etc)
    return str

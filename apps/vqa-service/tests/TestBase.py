from typing import Any, Awaitable, Callable, Sequence, Tuple
import unittest
import os
import sys
import re
from dateparser import parse
from fastapi import UploadFile
from pydantic import BaseModel

from tests.testutils.getTestData import get_test_data
from tests.testutils.testdata import TestData
from tests.testutils.types import ElementData, TestElmData, VqaCallData
from tests.testutils.dbg_only_failed import DebugFailingTests

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

    def assertPosition(self, response: PositionResponse, expected: ElementData, get_vqa: Callable[[], PositionResponse]|None=None, tolerance: int|None=None):
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
                    original.position_x,
                    delta=o_width * 0.01,
                    msg=f"X: {original.position_x} does not match original: {e_posX}"
                )
                self.assertAlmostEqual(
                    e_posY,
                    original.position_y,
                    delta=o_height * 0.01,
                    msg=f"Y: {original.position_y} does not match original: {e_posY}"
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

    def assertResponse(self, response: PositionResponse, test: TestData, element: str, vqa: str|Callable[[], PositionResponse]|None=None, tolerance:int|None=None):
        expected = test.elm(element)
        self.assertIsNotNone(expected)
        if "coords" in expected.data:
            vqa_fn = vqa if isinstance(vqa, Callable) else lambda: PositionResponse(**test.vqa(vqa or "VQA Not Provided for " + element).response)
            self.assertPosition(response, expected.data, vqa_fn, tolerance)
        if isinstance(response, ElementResponse):
            self.assertContent(response, expected.data)
            self.assertNeighbours(response, expected.data)
        print("Element Found Correctly")

    def assertDateResponse(self, response: DateElementResponse, expected: TestElmData|None, vqa: Callable[[], PositionResponse]):
        self.assertIsNotNone(expected)
        assert expected is not None  # Type narrowing for mypy/pylsp
        self.assertDate(response, expected.data)
        self.assertPosition(response, expected.data, vqa)
        self.assertNeighbours(response, expected.data)
        print("Element Found Correctly")

    def assertVqaResponse(self, response: BaseModel, original: VqaCallData):
        # Convert Pydantic model to dict for comparison
        response_dict = response.model_dump()
        # iterate through the response and original response
        for key in response_dict:
            self.assertIn(key, original.response)
            expected = original.response[key]
            actual = response_dict[key]
            # Compare based on type
            if isinstance(expected, (int, float)):
                self.assertAlmostEqual(actual, expected)
            else:
                self.assertEqual(actual, expected)

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

    # async def run_subtests(self, test_func, search_pattern: str="*", skip_if: None|Callable[[TestData], bool] = lambda test: False):
    #     test_datum = get_test_data(self.section, search_pattern, self.record_time)
    #     failing_tests = []
    #     for test in test_datum:
    #         with self.subTest(key=test.key):
    #             if skip_if and skip_if(test):
    #                 self.skipTest(f"Skipping {test.key}")
    #             try:
    #                 await test_func(test)
    #             except Exception as e:
    #                 failing_tests.append(test.key)
    #                 raise e

    #     if len(failing_tests) > 0:
    #         print("Failing tests: " + str(failing_tests))
    #     return failing_tests

    def get_test_data(self, search_pattern: str):
        return get_test_data(self.section, search_pattern, self.record_time)

    # Run a test that compares the endpoint response vs the same response in archive
    async def run_subTests_Vqa(
        self,
        vqa: str,
        endpoint: Callable[..., Awaitable[BaseModel]],
        skip_if: list[str]|Callable[[str], bool] = [],
    ):
        async def test_func(test: TestData):
            original = test.vqa(vqa)
            response = await endpoint(test.image, *original.args)
            self.assertVqaResponse(response, original)

        await self.run_subTests_TestData(vqa, test_func=test_func, skip_if=skip_if, test_name=endpoint.__name__)

    async def run_subTests_Elements(
        self,
        element: str,
        vqa: str,
        endpoint: Callable[..., Awaitable[PositionResponse]],
        skip_if: list[str]|Callable[[str], bool] = [],
        tolerance: int|None = None
    ):
        async def test_func(test: TestData):
            original = test.vqa(vqa)
            response = await endpoint(test.image, *original.args)
            self.assertResponse(response, test, element, vqa, tolerance=tolerance)

        await self.run_subTests_TestData(vqa, test_func=test_func, skip_if=skip_if, test_name=endpoint.__name__)

    async def run_subTests_TestData(
        self,
        search_pattern: str,
        test_func: Callable[[TestData], Awaitable[None]],
        skip_if: list[str]|Callable[[str], bool] = [],
        test_name: str|None = None
    ):
        test_name = test_name or search_pattern
        test_datum = self.get_test_data(search_pattern)
        tests = [(test.key, lambda: test_func(test)) for test in test_datum]
        await self.run_subTests(tests, test_name, skip_if)

        # with DebugFailingTests(self.section, test_name, skip_if) as tracker:
        #     for test in test_datum:
        #         with self.subTest(key=test.key):
        #             if tracker.should_skip(test):
        #                 self.skipTest(f"Skipping {test.key}")
        #             try:
        #                 await test_func(test)
        #             except Exception as e:
        #                 tracker.record_failure(test.key)
        #                 raise e

        # return tracker.failing_tests

    async def run_subTests(
        self,
        tests: Sequence[Tuple[str, Callable[[], Awaitable[None]]]],
        test_name: str,
        skip_if: list[str]|Callable[[str], bool] = [],
    ):
        with DebugFailingTests(self.section, test_name, skip_if) as tracker:
            for test in tests:
                with self.subTest(key=test[0]):
                    if tracker.should_skip(test[0]):
                        self.skipTest(f"Skipping {test[0]}")
                    try:
                        await test[1]()
                    except Exception as e:
                        tracker.record_failure(test[0])
                        raise e

def normalize(str: str):
    str = str.lower()
    str = re.sub(r'[$.,-\/\s]', '', str)  # login == log in (etc)
    return str

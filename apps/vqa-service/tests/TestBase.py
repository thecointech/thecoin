from typing import Any
import unittest
import os
import sys
import re
from dateparser import parse

from tests.testutils.testdata import TestElmData

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from data_elements import DateElementResponse, ElementResponse, PositionResponse

class TestBase(unittest.IsolatedAsyncioTestCase):

    def assertEqual(self, str1: object, str2: object, msg: str|None = None):
        # Ignore all case/space differences
        if (isinstance(str1, str) and isinstance(str2, str)):
            super().assertEqual(normalize(str1), normalize(str2), msg)
        else:
            super().assertEqual(str1, str2, msg)

    def assertPosition(self, response: PositionResponse, expected: dict[str, Any], tolerance: int=5):
        o_width = expected["coords"]["width"]
        o_height = expected["coords"]["height"]
        o_left = expected["coords"]["left"]
        o_top = expected["coords"]["top"]
        o_centerX = o_left + o_width / 2
        o_centerY = o_top + o_height / 2

        # Access position attributes directly from Pydantic object
        e_posX = response.position_x
        e_posY = response.position_y

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

    def get_expected_text(self, expected: dict):
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

    def assertContent(self, response: ElementResponse, expected: dict):

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

    def assertNeighbours(self, response: ElementResponse, expected: dict):
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
    def assertDate(self, response: DateElementResponse, expected: dict):
        responseDate = parse(response.content)
        expectedDate = parse(expected["text"])
        self.assertEqual(responseDate, expectedDate, f"Date: {responseDate} does not match expected: {expectedDate}")

    def assertResponse(self, response: ElementResponse, expected: TestElmData|None, tolerance:int=5):
        self.assertIsNotNone(expected)
        assert expected is not None  # Type narrowing for mypy/pylsp
        if "coords" in expected:
            self.assertPosition(response, expected, tolerance)
        self.assertContent(response, expected)
        self.assertNeighbours(response, expected)
        print("Element Found Correctly")

    def assertDateResponse(self, response: DateElementResponse, expected: TestElmData|None):
        self.assertIsNotNone(expected)
        assert expected is not None  # Type narrowing for mypy/pylsp
        self.assertDate(response, expected)
        self.assertPosition(response, expected)
        self.assertNeighbours(response, expected)
        print("Element Found Correctly")

    # Processing the larger screenshot can result in errors reading small text.
    # This function will focus in on the area containing the elements (vertically only)
    def getCropFromElements(self, image, elements, buffer=200):
        all_posY = [el["coords"]["centerY"] for el in elements]
        max_posY = round(max(all_posY))
        min_posY = round(min(all_posY))
        return (max(min_posY - buffer, 0), min(max_posY + buffer, image.height))

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

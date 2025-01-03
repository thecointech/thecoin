import unittest
import os
import sys
import re
from PIL import Image

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from query import runQuery  # noqa: E402

class TestBase(unittest.TestCase):

    def assertEqual(self, str1, str2, msg=None):
        # Ignore all case/space differences
        if (isinstance(str1, str) and isinstance(str2, str)):
            super().assertEqual(normalize(str1), normalize(str2), msg)
        else:
            super().assertEqual(str1, str2, msg)


    def assertResponse(self, response: dict, image: Image, expected: dict, key: str = None):
        textOverlap = (
            normalize(expected["text"]) in normalize(response["content"]) or
            normalize(response["content"]) in normalize(expected["text"])
        )
        self.assertTrue(textOverlap, f"Text: {response['content']} does not match expected: {expected['text']} in {key}")

        o_width = expected["coords"]["width"]
        o_height = expected["coords"]["height"]
        o_left = expected["coords"]["left"]
        o_top = expected["coords"]["top"]
        o_centerX = o_left + o_width / 2
        o_centerY = o_top + o_height / 2

        e_posX = cast_value(response, "position_x", image.width)
        e_posY = cast_value(response, "position_y", image.height)

        self.assertAlmostEquals(
            e_posX,
            o_centerX,
            delta=o_width * 0.6,
            msg=f"X: {e_posX} does not match expected: {o_centerX} with width: {o_width} in {key}"
        )
        self.assertAlmostEquals(
            e_posY,
            o_centerY,
            delta=o_height * 0.6,
            msg=f"Y: {e_posY} does not match expected: {o_centerY} with height: {o_height} in {key}"
        )

        # The bounding box is not guaranteed to be perfect, so
        # be very generous with the bounds.  It should score points if there is
        # any potential overlap of the two bounding boxes
        xValid = (
            response["position_x"] > (o_left - o_width * 0.2) and
            response["position_x"] < (o_left + o_width * 1.2)
        )
        yValid = (
            response["position_y"] > (o_top - o_height * 0.2) and
            response["position_y"] < (o_top + o_height * 1.2)
        )
        self.assertTrue(xValid, f"X: {response['position_x']} does not match expected: {o_left} with width: {o_width} in {key}")
        self.assertTrue(yValid, f"Y: {response['position_y']} does not match expected: {o_top} with height: {o_height} in {key}")

        # siblingText is quite restrictive, so it may not have any values
        # if it does, then there should be a match (except in Scotiabank)
        o_neigbours = [normalize(s) for s in expected["siblingText"]]
        if (normalize(response["neighbour_text"]) in o_neigbours):
            # This can be wrong because it might pick up neighbours above/below
            # so just reassure ourselves when we do get it right :-)
            # test.assertIn(normalize(response["neighbour_text"]), o_neigbours)
            print("Found: " + normalize(response["neighbour_text"]) + " in " + str(o_neigbours))

        print("Element Found Correctly")


def normalize(str: str):
    str = str.lower()
    str = re.sub(r'[.,-\/\s]', '', str)  # login == log in (etc)
    return str


def cast_value(response, key, scale):
    if key in response:
        try:
            response[key] = round(scale * float(response[key]) / 100)
        except ValueError:
            print("Invalid value for " + key + ": " + response[key])
            response[key] = None

        return response[key]


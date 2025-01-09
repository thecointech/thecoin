import unittest
import os
import sys
import re
from PIL import Image
import time

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

    def assertPosition(self, response: dict, image: Image, expected: dict, key: str = None):
        o_width = expected["coords"]["width"]
        o_height = expected["coords"]["height"]
        o_left = expected["coords"]["left"]
        o_top = expected["coords"]["top"]
        o_centerX = o_left + o_width / 2
        o_centerY = o_top + o_height / 2

        e_posX = response["position_x"]
        e_posY = response["position_y"]

        self.assertAlmostEquals(
            e_posX,
            o_centerX,
            delta=max(20, o_width * 0.6 ),
            msg=f"X: {e_posX} does not match expected: {o_centerX} with width: {o_width} in {key}"
        )
        self.assertAlmostEquals(
            e_posY,
            o_centerY,
            delta=max(20, o_height * 0.6),
            msg=f"Y: {e_posY} does not match expected: {o_centerY} with height: {o_height} in {key}"
        )

    def assertResponse(self, response: dict, image: Image, expected: dict, key: str = None):
        if (expected["text"] == ""):
            # If no text expected, then response should be empty
            self.assertEqual(response["content"], "", "Text: " + response["content"] + " does not match expected: " + expected["text"] + " in " + key)
        else:
            # Else, just check they overlap in some way
            textOverlap = (
                normalize(expected["text"]) in normalize(response["content"]) or
                normalize(response["content"]) in normalize(expected["text"])
            )
            self.assertTrue(textOverlap, f"Text: {response['content']} does not match expected: {expected['text']} in {key}")

        self.assertPosition(response, image, expected, key)

        # siblingText is quite restrictive, so it may not have any values
        # if it does, then there should be a match (except in Scotiabank)
        o_neigbours = [normalize(s) for s in expected["siblingText"]]
        if (normalize(response["neighbour_text"]) in o_neigbours):
            # This can be wrong because it might pick up neighbours above/below
            # so just reassure ourselves when we do get it right :-)
            # test.assertIn(normalize(response["neighbour_text"]), o_neigbours)
            print("Found: " + normalize(response["neighbour_text"]) + " in " + str(o_neigbours))

        print("Element Found Correctly")

    # Processing the larger screenshot can result in errors reading small text.
    # This function will focus in on the area containing the elements (vertically only)
    def getCropFromElements(self, image, elements, buffer=200):
        all_posY = [el["coords"]["centerY"] for el in elements]
        max_posY = max(all_posY)
        min_posY = min(all_posY)
        return (0, max(min_posY - buffer, 0), image.width, min(max_posY + buffer, image.height))

    def adjustElementsToCrop(self, elements, crop):
        (x, y, w, h) = crop
        for el in elements:
            el["coords"]["centerY"] = el["coords"]["centerY"] - y
            el["coords"]["top"] = el["coords"]["top"] - y
            el["coords"]["left"] = el["coords"]["left"] - x

    # Processing the larger screenshot can result in errors reading small text.
    # This function will focus in on the area containing the elements (vertically only)
    def cropToElements(self, image, elements, buffer=200):
        crop = self.getCropFromElements(image, elements, buffer)
        self.adjustElementsToCrop(elements, crop)
        return image.crop(crop)

    # NOTE: Not tested (not used anymore)
    # def cropToResponse(self, image, response, buffer=200):
    #     pass


def normalize(str: str):
    str = str.lower()
    str = re.sub(r'[$.,-\/\s]', '', str)  # login == log in (etc)
    return str


# default timeout of 1hr
def repeat_on_fail(func, timeout = 3600):
    def wrapper(*args, **kwargs):
        # Do not repeat if no debugger attached
        if (os.environ.get('DEBUGPY_RUNNING') != "true"):
            return func(*args, **kwargs)

        # If a debugger is atttached, someone is watching.
        # Keep trying until time is up
        start_time = time.time()
        while True:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print(e)
            if time.time() - start_time > timeout:
                raise Exception("Timeout")
    return wrapper
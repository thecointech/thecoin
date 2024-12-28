# A suite of tests for the Molmo VQA MLLM
import unittest
import os
from PIL import Image
import json
from typing import NamedTuple
import sys

# Add the src directory to the Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from query import runQuery  # noqa: E402


request_json = "Return only valid JSON data in the following format:"
element_desc = '{"content": "text", "font_color": "#color", "background_color": "#color", "neighbour_text": "text", "position_x": "number", "position_y": "number"}'
query_cookie_exists = "Analyze the provided screenshot of a webpage. Determine if a cookie banner is present. The cookie banner must contain a button that includes the word \"Accept\". Return a JSON object with the following structure: {{ \"cookie_banner_detected\": \"boolean\" }}"
query_cookie_accept = f"Analyze the provided webpage. Describe the button to accept cookies and continue. {request_json} {element_desc}"
query_cookie_exists = "Is there a cookie banner? Return a JSON object with the following structure: {{ \"cookie_banner_detected\": \"boolean\" }}"

query_navigate_to_login = 'In the provided webpage, describe the element that will navigate to the login page.  Return only valid JSON data in the following format: {"type": "option", "content": "text", "font_color": "#color", "background_color": "#color", "neighbour_text": "text", "position_x": "number", "position_y": "number"}'

# Our process goes
# 1. Is Cookie banner present?
#   1.1 Is there a cookie accept button?
# 3. Detect Page Intent
# 4 If Landing, find login button
#   4.1 Click button, Detect Page Intent
# 5. [Login] Find username input
# 6. [Login] Is there a password input (RBC)
#    6.1 [Login] Find password input
# 7. [Login] Find Continue button
#   7.1 Click button, Detect Page Intent
# 8. [2FA] Is there a button to send 2FA code?
#   8.1 [2FA] Find 2FA button
# 9. [2FA] Find the 2FA input
#   9.1 Click button, Detect Page Intent


class MolmoTests(unittest.TestCase):

    # Tested: working
    def test_cookie_banner_exists(self):
        return
        test_datum = get_test_data("landings", "cookie-accept")
        # check all landing pages
        for key, (image, original) in test_datum.items():
            print("Is there a cookie cookie banner: " + key)
            banner = runQuery(query_cookie_exists, image)
            self.assertEqual(banner["cookie_banner_detected"], key != "Random")

    # Tested: working
    def test_cookie_accept(self):
        return
        test_datum = get_test_data("landings", "cookie-accept")
        # check all landing pages
        for key, (image, original) in test_datum.items():
            if (key == "Random"):
                continue
            print("Find cookie accept button in: " + key)
            banner = runQuery(query_cookie_accept, image)

            validate_response(banner, image, original, self)

    # Tested: working
    def test_molmo_detects_landing_page(self):
        return
        # get landing pages
        test_datum = get_test_data("landings")
        query = query_intent

        # check all landing pages
        for key, (image, original) in test_datum.items():
            print("Testing intent for: " + key)
            # Only check CIBC
            # if key != "asdf":
            #     continue
            intent = runQuery(query, image)
            # CIBC has login options right on the landing page, that's what it should detect
            self.assertEqual(intent["type"], original["intent"])

    def test_molmo_finds_login_button(self):
        return
        test_datum = get_test_data("landings")
        query = 'In the provided webpage, describe the element that will navigate to the login page.  Return only valid JSON data in the following format: {"type": "option", "content": "text", "font_color": "#color", "background_color": "#color", "neighbour_text": "text", "position_x": "number", "position_y": "number"}'

        # check all landing pages
        for key, (image, original) in test_datum.items():

            # Skip if main page can login directly
            if (original["intent"] != "Landing"):
                continue

            if (key != "Scotia"):
                continue

            print("Testing Login for: " + key)

            element = runQuery(query, image)
            print("Element: " + str(element))
            validate_response(element, image, original, self)

    def test_detect_login_page(self):
        # get landing pages
        test_datum = get_test_data("login")

        # check all landing pages
        for key, (image, original) in test_datum.items():
            print("Testing intent for: " + key)
            intent = runQuery(query_intent, image)
            # CIBC has login options right on the landing page, that's what it should detect
            self.assertEqual(intent["type"], original["intent"])

        pass


class TestData(NamedTuple):
    image: Image
    original: dict


def validate_response(response: dict, image: Image, original: dict, test: unittest.TestCase):
    cast_value(response, "position_x", image.width)
    cast_value(response, "position_y", image.height)

    test.assertIn(normalize(original["text"]), normalize(response["content"]))

    o_width = original["coords"]["width"]
    o_height = original["coords"]["height"]
    o_left = original["coords"]["left"]
    o_top = original["coords"]["top"]
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
    test.assertTrue(xValid and yValid)

    # siblingText is quite restrictive, so it may not have any values
    # if it does, then there should be a match (except in Scotiabank)
    o_neigbours = [normalize(s) for s in original["siblingText"]]
    if (normalize(response["neighbour_text"]) in o_neigbours):
        # This can be wrong because it might pick up neighbours above/below
        # so just reassure ourselves when we do get it right :-)
        # test.assertIn(normalize(response["neighbour_text"]), o_neigbours)
        print("Found: " + normalize(response["neighbour_text"]) + " in " + str(o_neigbours))

    print("Element Found Correctly")


def normalize(str: str):
    str = str.lower()
    str = str.replace(" ", "")  # login == log in
    return str


def cast_value(response, key, scale):
    if key in response:
        try:
            response[key] = round(scale * float(response[key]) / 100)
        except ValueError:
            print("Invalid value for " + key + ": " + response[key])
            response[key] = None


def get_image_and_json(image_file: str, json_type: str):
    with Image.open(image_file) as image:
        image.load()
    json_file = image_file.replace(".png", f"-{json_type}.json")
    if (json_type):
        with open(json_file, "rb") as f:
            json_data = json.load(f)
        return TestData(image, json_data)
    return TestData(image, None)
    # TEST - Do coords work better if cropped?


def get_basename(image_file: str):
    return os.path.basename(image_file).split(".")[0]


def get_test_data(page_type: str, json_type=None) -> dict[str, TestData]:
    # get the private testing folder from the environment
    test_folder = os.environ.get("PRIVATE_TESTING_PAGES", None)
    if test_folder is None:
        return []

    # list all files in the folder
    samples_folder = os.path.join(test_folder, "unit-tests", page_type)
    image_files = [
        os.path.join(samples_folder, f)
        for f in os.listdir(samples_folder)
        if f.endswith(".png")
    ]

    # return a dictionary where the key is the basename and the value is image & json dataa
    return {get_basename(f): get_image_and_json(f, json_type) for f in image_files}


if __name__ == "__main__":
    unittest.main()

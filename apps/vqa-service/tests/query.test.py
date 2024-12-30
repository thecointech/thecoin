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
query_intent = " From the following options, select the one that best describes the given webpage: Landing, Login, AccountSelect, AccountDetails, PayBill, SendTransfer, ModalDialog, ErrorMessage. Return only valid JSON data in the following format: {\"type\": \"option\"}"
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




if __name__ == "__main__":
    unittest.main()

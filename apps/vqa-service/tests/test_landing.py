# A suite of tests for the Molmo VQA MLLM
from TestBase import TestBase
from testdata import get_test_data, get_single_test_element
from query import runQuery  # noqa: E402
from query_page_intent import intent_prompt


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


class TestLanding(TestBase):

    # Tested: working
    def test_landing_page_intent(self):
        # get landing pages
        # All pages are required to have an intent, so don't filter them out here
        test_datum = get_test_data("landings", "initial")

        # check all landing pages
        for key, image, expected in test_datum:
            print("Testing intent for: " + key)
            intent = runQuery(intent_prompt, image)
            self.assertEqual(intent["type"], expected["intent"]["intent"])

    # Tested: working
    def test_cookie_banner_exists(self):
        test_datum = get_test_data("landings", "initial")
        # check all landing pages
        for key, image, expected in test_datum:
            print("Is there a cookie cookie banner: " + key)
            banner = runQuery(query_cookie_exists, image)
            self.assertEqual(banner["cookie_banner_detected"], "cookie-accept" in expected)

    # Tested: working
    def test_cookie_accept(self):
        test_datum = get_single_test_element("landings", "initial", "cookie-accept")
        # check all landing pages
        for key, image, expected in test_datum:
            print("Find cookie accept button in: " + key)
            banner = runQuery(query_cookie_accept, image)
            self.assertResponse(banner, image, expected, key)

    def test_molmo_finds_login_button(self):
        test_datum = get_single_test_element("landings", "initial", "login")
        # check all landing pages
        for key, image, original in test_datum:
            print("Testing Login Navigation for: " + key)
            element = runQuery(query_navigate_to_login, image)
            self.assertResponse(element, image, original, key)




if __name__ == "__main__":
    unittest.main()

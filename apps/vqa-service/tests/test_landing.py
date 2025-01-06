# A suite of tests for the Molmo VQA MLLM
from TestBase import TestBase
from testdata import get_test_data, get_single_test_element
from query import runQuery  # noqa: E402
from landing_data import *
from intent_data import query_page_intent

# Our process goes
# 1. Is Cookie banner present?
#   1.1 Is there a cookie accept button?
# 2 If Landing, find login button
#   2.1 Click button
#   2.2 Detect Page Intent
#   2.3 Goto 2

class TestLanding(TestBase):

    def test_landing_page_intent(self):
        # get landing pages
        # All pages are required to have an intent, so don't filter them out here
        test_datum = get_test_data("landings", "initial")

        # check all landing pages
        for key, image, expected in test_datum:
            print("Testing intent for: " + key)
            intent = runQuery(image, query_page_intent)
            self.assertEqual(intent["type"], expected["intent"]["intent"])

    def test_cookie_banner_exists(self):
        test_datum = get_test_data("landings", "initial")
        # check all landing pages
        for key, image, expected in test_datum:
            print("Is there a cookie cookie banner: " + key)
            banner = runQuery(image, query_cookie_exists)
            self.assertEqual(banner["cookie_banner_detected"], "cookie-accept" in expected)

    def test_cookie_accept(self):
        test_datum = get_single_test_element("landings", "initial", "cookie-accept")
        # check all landing pages
        for key, image, expected in test_datum:
            print("Find cookie accept button in: " + key)
            banner = runQuery(image, query_cookie_accept)
            self.assertResponse(banner, image, expected, key)

    def test_molmo_finds_login_button(self):
        test_datum = get_single_test_element("landings", "initial", "login")
        # check all landing pages
        for key, image, original in test_datum:
            print("Testing Login Navigation for: " + key)
            element = runQuery(image, query_navigate_to_login)
            self.assertResponse(element, image, original, key)




if __name__ == "__main__":
    unittest.main()

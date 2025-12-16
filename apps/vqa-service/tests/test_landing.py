# A suite of tests for the Molmo VQA MLLM
import unittest
from TestBase import TestBase
from geo_math import BBox
from testdata import get_test_data, get_single_test_element
from intent_routes import page_intent
from landing_routes import (
    cookie_banner_present,
    cookie_banner_accept,
    navigate_to_login,
    navigate_to_login_menu
)

# Our process goes
# 1. Is Cookie banner present?
#   1.1 Is there a cookie accept button?
# 2 If Landing, find login button
#   2.1 Click button
#   2.2 Detect Page Intent
#   2.3 Goto 2

class TestLanding(TestBase):

    # async def test_landing_page_intent(self):
    #     # get landing pages
    #     # All pages are required to have an intent, so don't filter them out here
    #     test_datum = get_test_data("Landing", "initial")
    #     for key, image, expected in test_datum:
    #         with self.subTest(key=key):
    #             response = await page_intent(image)
    #             self.assertEqual(response.type, expected["intent"]["intent"])

    async def test_cookie_banner_present(self):
        test_datum = get_test_data("CookieBanner")
        for test in test_datum:
            with self.subTest(key=test.key):
                response = await cookie_banner_present(test.image)
                self.assertEqual(response.cookie_banner_detected, "cookie-accept" in test.elements)

    async def test_cookie_accept(self):
        test_datum = get_single_test_element("CookieBanner", "cookie-accept")
        for test in test_datum:
            with self.subTest(key=test.key):
                response = await cookie_banner_accept(test.image)
                self.assertResponse(response, test.element, test.key)

    async def test_finds_login_button(self):
        test_datum = get_single_test_element("Landing", "login")
        for test in test_datum:
            with self.subTest(key=test.key):
                response = await navigate_to_login(test.image)
                self.assertResponse(response, test.element, test.key)

    async def test_finds_login_button_in_menu(self):
        test_datum = get_single_test_element("Landing", "menu")
        for test in test_datum:
            with self.subTest(key=test.key):
                intent = await page_intent(test.image)
                self.assertEqual(intent.type, "MenuSelect", "Login intent failed for " + test.key)
                response = await navigate_to_login_menu(test.image, BBox(bottom=770))
                self.assertResponse(response, test.element, test.key)


if __name__ == "__main__":
    unittest.main()

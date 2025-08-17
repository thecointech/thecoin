import unittest
from TestBase import TestBase
from testdata import get_test_data
from login_routes import (
    detect_username_input,
    detect_password_exists,
    detect_password_input,
    detect_continue_element,
    detect_login_element,
    detect_login_error
)
from tests.repeat_on_failure import repeat_on_fail


class TestLoginProcess(TestBase):

    async def test_detect_username_input(self):
        samples = get_test_data("Login", "username")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_username_input(sample.image())
                self.assertResponse(response, sample.elm("username"))

    # All pages must be able to detect if password is present
    async def test_detect_password_exists(self):
        samples = get_test_data("Login")
        no_loading = [s for s in samples if
            not s.has_vqa("pageIntent") or s.vqa("pageIntent").response["type"] not in ["Loading", "Blank"]
        ]
        for sample in no_loading:
            matching_pages = [s for s in samples if s.html and s.html_location == sample.html_location]
            with self.subTest(key=sample.key):
                response = await detect_password_exists(sample.image())
                exists = any(s.has_element("password") for s in matching_pages)
                self.assertEqual(response.password_input_detected, exists,
                                  f"Password exists failed for {sample.key}")

    # What is the password input?
    async def test_detect_password_input(self):
        samples = get_test_data("Login", "password")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_password_input(sample.image())
                self.assertResponse(response, sample.elm("password"))

    async def test_detect_continue_button(self):
        samples = get_test_data("Login", "continue")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_continue_element(sample.image())
                self.assertResponse(response, sample.elm("continue"))

    async def test_detect_login_button(self):
        samples = get_test_data("Login", "login")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_login_element(sample.image())
                self.assertResponse(response, sample.elm("login"))

    async def test_detect_login_error(self):
        samples = get_test_data("Login", "detectLoginError")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_login_error(sample.image())
                expected = sample.vqa("Error").response
                self.assertEqual(response.error_message_detected, expected["error_message_detected"])
                self.assertEqual(response.error_message, expected["error_message"])


if __name__ == "__main__":
    unittest.main()

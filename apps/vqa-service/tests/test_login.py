from TestBase import TestBase
from testdata import get_test_data, get_single_test_element
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
        samples = get_single_test_element("Login", "username")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_username_input(sample.image)
                self.assertResponse(response, sample.element, sample.key)

    # All pages must be able to detect if password is present
    async def test_detect_password_exists(self):
        samples = get_test_data("Login")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_password_exists(sample.image)
                matching_pages = [s for s in samples if s.html_location == sample.html_location]
                exists = any("password" in s.elements for s in matching_pages)
                self.assertEqual(response.password_input_detected, exists,
                                  f"Password exists failed for {sample.key}")

    # What is the password input?
    async def test_detect_password_input(self):
        samples = get_single_test_element("Login", "password")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_password_input(sample.image)
                self.assertResponse(response, sample.element, sample.key)

    async def test_detect_continue_button(self):
        samples = get_single_test_element("Login", "continue")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_continue_element(sample.image)
                self.assertResponse(response, sample.element, sample.key)

    async def test_detect_login_button(self):
        samples = get_single_test_element("Login", "login")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_login_element(sample.image)
                self.assertResponse(response, sample.element, sample.key)

    async def test_detect_login_error(self):
        samples = get_single_test_element("Login", "error")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await detect_login_error(sample.image)
                self.assertResponse(response, sample.element, sample.key)


if __name__ == "__main__":
    unittest.main()

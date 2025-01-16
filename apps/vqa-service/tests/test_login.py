from TestBase import TestBase
from testdata import get_test_data, get_single_test_element
from intent_routes import page_intent
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

    # All initial pages must pass intent
    async def test_intent(self):
        test_data = get_test_data("login", "initial")
        for key, image, _ in test_data:
            with self.subTest(key=key):
                response = await page_intent(image)
                self.assertEqual(response.type, "login", f"Login intent failed for {key}")

    @repeat_on_fail
    async def test_detect_username_input(self):
        test_data = get_single_test_element("login", "initial", "username")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await detect_username_input(image)
                self.assertResponse(response, expected, key)
    
    # All pages must be able to detect if password is present
    async def test_detect_password_exists(self):
        test_data = (
            ("initial", get_test_data("login", "initial")),
            ("password", get_test_data("login", "password"))
        )
        for (base, test_data) in test_data:
            for key, image, expected in test_data:
                with self.subTest(base=base, key=key):
                    response = await detect_password_exists(image)
                    exists = "password" in expected
                    self.assertEqual(response.password_input_detected, exists, 
                                  f"Password exists failed for {key}")

    # What is the password input?
    @repeat_on_fail
    async def test_detect_password_input(self):
        test_data = (
            ("initial", get_test_data("login", "initial")),
            ("password", get_test_data("login", "password"))
        )
        for (base, test_data) in test_data:
            for key, image, expected in test_data:
                if "password" in expected:
                    with self.subTest(base=base, key=key):
                        response = await detect_password_input(image)
                        self.assertResponse(response, expected["password"], key)

    @repeat_on_fail
    async def test_detect_continue_button(self):
        test_data = get_single_test_element("login", "initial", "continue")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await detect_continue_element(image)
                self.assertResponse(response, expected, key)

    @repeat_on_fail
    async def test_detect_login_button(self):
        test_data = get_single_test_element("login", "password", "login")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await detect_login_element(image)
                self.assertResponse(response, expected, key)

    async def test_detect_login_error(self):
        test_data = get_single_test_element("login", "error", "error")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await detect_login_error(image)
                self.assertResponse(response, expected, key)


if __name__ == "__main__":
    unittest.main()

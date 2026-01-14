import unittest
from TestBase import TestBase
from testutils.testdata import TestData
from login_routes import (
    detect_logout_element,
    detect_username_input,
    detect_password_exists,
    detect_password_input,
    detect_continue_element,
    detect_login_element,
    detect_login_error
)

class TestLoginProcess(TestBase):
    section = "Login"
    record_time = "archive"

    async def test_detect_username_input(self):
        await self.verify_elements(
            "username",
            endpoint=detect_username_input,
            vqa="detectUsernameInput"
        )

    skip_pwd_exists = [
        # Detection is correct, bug in recording messed up img/elm alignment
        'archive/2026-01-02_15-11/RBC/Login-1'
    ]
    async def test_detect_password_exists(self):
        async def detect_password(test: TestData):
            response = await detect_password_exists(test.image)
            original = test.vqa("detectPasswordExists").response
            self.assertEqual(response.password_input_detected, original["password_input_detected"])
        await self.verify_elements(
            "detectPasswordExists",
            test_func=detect_password,
            skip_if=lambda test: test.key in self.skip_pwd_exists
            )

        # The following tests all pages, however we can't reliably
        # determine if a password exists or not for pages if we
        # didn't call this function originally

        # tests = get_test_data("Login", "*", self.record_time)
        # no_loading = [s for s in tests if
        #     not s.has_vqa("pageIntent") or s.vqa("pageIntent").response["type"] not in ["Loading", "Blank"]
        # ]
        # # group tests by folder
        # runs: dict[str, list[TestData]] = {}
        # for test in no_loading:
        #     run = test._matched_folder
        #     if run not in runs:
        #         runs[run] = []
        #     runs[run].append(test)

        # for run in runs:
        #     for test in runs[run]:
        #         # if test.key != "archive/2026-01-05_15-27/Tangerine/Login-1":
        #         #     continue
        #         matching_pages = [s for s in runs[run] if s.html and s.html_location == test.html_location]
        #         with self.subTest(key=test.key):
        #             response = await detect_password_exists(test.image)
        #             exists = any(s.has_element("password") for s in matching_pages)
        #             self.assertEqual(response.password_input_detected, exists)

    # What is the password input?
    async def test_detect_password_input(self):
        await self.verify_elements(
            "password",
            endpoint=detect_password_input
        )

    async def test_detect_continue_button(self):
        await self.verify_elements(
            "continue",
            vqa="detectContinueElement",
            endpoint=detect_continue_element
        )

    async def test_detect_login_button(self):
        await self.verify_elements(
            "login",
            vqa="detectLoginElement",
            endpoint=detect_login_element
        )

    async def test_detect_login_error(self):
        async def test_login_error(sample: TestData):
                response = await detect_login_error(sample.image)
                expected = sample.vqa("Error").response
                self.assertEqual(response.error_message_detected, expected["error_message_detected"])
                self.assertEqual(response.error_message, expected["error_message"])
        await self.verify_elements(
            "detectLoginError",
            test_func=test_login_error,
        )

if __name__ == "__main__":
    unittest.main()

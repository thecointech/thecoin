
from TestBase import TestBase, runQuery
from testdata import get_test_data, get_single_test_element

from intent_data import query_page_intent
from error_data import query_error_message, query_error_text
from login_data import *
from tests.repeat_on_failure import repeat_on_fail


class TestLoginProcess(TestBase):

    # All initial pages must pass intent
    def test_intent(self):
        test_data = get_test_data("login", "initial")
        for key, image, _ in test_data:
            with self.subTest(key=key):
                intent = runQuery(image, query_page_intent)
                self.assertEqual(intent["type"], "login", "Login intent failed for " + key)

    def test_detect_username_input(self):
        test_data = get_single_test_element("login", "initial", "username")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                element = runQuery(image, query_username_element)
                self.assertResponse(element, image, expected, key)
    
    # All pages must be able to detect if password is present
    def test_detect_password_exists(self):
        test_data = (
            get_test_data("login", "initial") + 
            get_test_data("Landing", "initial") + 
            get_test_data("login", "password")
        )
        for key, image, expected in test_data:
            with self.subTest(key=key):
                element = runQuery(image, query_pwd_exists)
                exists = "password" in expected
                self.assertEqual(element["password_input_detected"], exists, "Password exists failed for " + key)

    # What is the password input?
    @repeat_on_fail
    def test_detect_password_input(self):
        test_data = (
            get_single_test_element("login", "initial", "password") + 
            get_single_test_element("login", "password", "password") + 
            get_single_test_element("login", "failed", "password")
        )
        for key, image, expected in test_data:
            with self.subTest(key=key):
                element = runQuery(image, query_password_element)
                self.assertResponse(element, image, expected, key)

    def test_continue(self):
        test_data = get_single_test_element("login", "initial", "continue")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                element = runQuery(image, query_continue_button)
                self.assertResponse(element, image, expected, key)

    # # All passed
    def test_detect_login_input(self):
        test_data = (
            get_single_test_element("login", "initial", "login") + 
            get_single_test_element("login", "password", "login") + 
            get_single_test_element("login", "failed", "login")
        )
        for key, image, expected in test_data:
            with self.subTest(key=key):
                element = runQuery(image, query_login_button)
                self.assertResponse(element, image, expected, key)


    def test_login_result_success(self):
        test_login_result(self, "AccountSummary", "initial", "LoginSuccess")

    def test_login_result_failed(self):
        test_login_result(self, "login", "failed", "LoginError")

    def test_login_result_2fa(self):
        test_login_result(self, "2fa", "initial", "TwoFactorAuth")


    # While this test is passing, it's probably not reliable enough yet to have directly in our harvesting setup.
    # It detects correctly, but also has too many false positives
    # False positives
    # Random has "please donate" message in Wikipedia which is formatted in Red, so is picked up
    # CIBC has postal service message which is picked up
    # Tangerine1 has a link to change username which is picked up as error
    # RBC has red outline on it's dialogs (from clicking during scraping thingy) which is probably the issue.  (We could fix this with better recording in Harvester)
    # Leaving it in here, but it will probably get adjusted/fixed later when we have to deal with errors properly
    def test_errors(self):
        test_data = get_single_test_element("login", "failed", "failed")
        for key, image, expected in test_data:

            detect = runQuery(image, query_error_message)
            self.assertEqual(detect["error_message_detected"], True, "Error message detection failed for " + key)
            error_message = runQuery(image, query_error_text)
            self.assertEqual(error_message["error_message"], expected["text"], "Error message failed for " + key)


def test_login_result(test, intent, state, expected):
    test_data = get_test_data(intent, state)
    for key, image, _ in test_data:
        with test.subTest(key=f"{expected}-{key}"):
            detect = runQuery(image, query_login_result)
            test.assertEqual(detect["result"], expected, "Login result failed for " + key)


if __name__ == "__main__":
    unittest.main()


import unittest
from testdata import get_test_data
from runQuery import runQuery
from helpers import validate_response, request_json, element_desc

query_username_element = f"Analyze the provided webpage. Describe the input for the username or cardnumber. {request_json} {element_desc}"
query_password_element = f"Describe the password text input in this webpage. {request_json} {element_desc}"
query_pwd_exists = f"Is there a password input? {request_json} {{ \"password_input_detected\": \"boolean\" }}"
query_continue_button = f"Analyze the provided webpage. Describe the element to proceed to the next step. {request_json} {element_desc}"
query_login_button = f"Describe the button to complete login in this webpage. {request_json} {element_desc}"
query_error_message = f"Analyze the provided webpage. If an error message that is preventing login is present, describe it. {request_json}  {{ \"error_message_detected\": \"boolean\", \"error_message\": \"text\" }}"


class QueryLoginUsernameTests(unittest.TestCase):
    def test_detect_username_input(self):
        return
        # get landing pages
        test_datum = get_test_data("login", "username")

        # check username elements
        for key, (image, original) in test_datum.items():
            if (skip_base(key)):
                continue
            print("Testing Username element: " + key)
            element = runQuery(query_username_element, image)
            validate_response(element, image, original, self)

    def test_detect_password_exists(self):
        return
        # does it have a password input?
        test_datum = get_test_data("login")
        for key, (image, original) in test_datum.items():
            if (skip_base(key)):
                continue
            print("Testing Pwd Exists for: " + key)
            element = runQuery(query_pwd_exists, image)
            exists = pwd_exists(key, test_datum)
            self.assertEqual(element["password_input_detected"], exists)

    # def test_continue(self):
    #     test_datum = get_test_data("login", "continue")
    #     for key, (image, original) in test_datum.items():
    #         if (skip_base(key)):
    #             continue
    #         # only pages without passwords should have a continue button
    #         if (pwd_exists(key, test_datum)):
    #             continue

    #         print("Testing for continue button: " + key)
    #         element = runQuery(query_continue_button, image)
    #         validate_response(element, image, original, self)

    # All passed
    # def test_detect_password_input(self):
    #     test_datum = get_test_data("login", "password")
    #     for key, (image, original) in test_datum.items():
    #         if (skip_base(key)):
    #             continue

    #         # make sure we are checking the right page for the password input
    #         if (not pwd_exists(key, test_datum)):
    #             # use the image from key + 1
    #             image = test_datum[key + "1"][0]

    #         print("Testing for password input: " + key)
    #         element = runQuery(query_password_element, image)
    #         validate_response(element, image, original, self)

    # # All passed
    # def test_detect_login_input(self):
    #     test_datum = get_test_data("login", "login")
    #     for key, (image, original) in test_datum.items():
    #         if (skip_base(key)):
    #             continue

    #         # make sure we are checking the right page for the password input
    #         if (not pwd_exists(key, test_datum)):
    #             # use the image from key + 1
    #             image = test_datum[key + "1"][0]

    #         print("Testing for login button: " + key)
    #         element = runQuery(query_login_button, image)
    #         validate_response(element, image, original, self)

    # NOT PASSING!
    def test_failed_login_input(self):
        test_datum = get_test_data("login", "login")
        for key, (image, original) in test_datum.items():
            if ("failed" not in key):
                continue
            print("Testing for error message: " + key)
            element = runQuery(query_error_message, image)
            print("Query Response: " + str(element))
            self.assertEqual(element["error_message_detected"], "failed" in key)


def pwd_exists(key, datum):
    return key + "1" not in datum


def skip_base(key):
    return "failed" in key or "Random" in key or "1" in key


if __name__ == "__main__":
    unittest.main()

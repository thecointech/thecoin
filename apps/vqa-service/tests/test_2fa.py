from TestBase import TestBase, runQuery
from testdata import get_test_data, get_single_test_element
from twofa_data import query_page_login_result, query_page_2fa_action, query_page_2fa_destinations, get_2fa_elements_for_phone, query_2fa_input_element, query_2fa_skip_element, query_2fa_submit_element

# detect_2fa_schema = {
#     "type": "object",
#     "properties": {
#         "intent": {
#             "type": "string",
#             "example": "option"
#         },
#     },
# }

# twofa_prompt = f"From the following options, select the one that best describes the given webpage: [LoginError, TwoFactorAuth, Unknown] {get_instruct_json_respose(detect_2fa_schema)}"


# detect_2fa_options = {
#     "type": "object",
#     "properties": {
#         "choice_required": {
#             "type": "boolean",
#             "description": "Is the user required to choose a 2FA method"
#         },
#     },
# }

# detect_2fa_action = {
#     "type": "object",
#     "properties": {
#         "action": {
#             "type": "string",
#             "example": "option"
#         },
#         "message": {
#             "type": "string",
#             "description": "The full message describing the 2-factor action required"
#         }
#     },
# }
# action_prompt = f"From the following options, select the one that best describes the action required in the given webpage [SelectDestination, InputCode, ApproveInApp, Error] {get_instruct_json_respose(detect_2fa_action)}"


# General flow
# Detect Login
# Attempt Login
# Detect Page Type
#  - Either Login (from 2FA or Failed)
#  - Or Account Select (success)
#  - Or other error (we don't have any samples for this yet, have to catch a website in the act...)
#
# IF ITS LOGIN (* what we solve here)
# Is it?
#  - Login Failed
#  - 2FA required

class Query2faTests(TestBase):

    # Can we tell the difference between failed login & 2FA required pages?
    # Working Jan2
    def test_2fa_page_intent(self):
        def test_vs_expected(data, expected):
            for key, image, _ in data:
                print(f"Testing {key} for {expected}")
                detected = runQuery(image, query_page_login_result)
                self.assertEqual(detected["intent"], expected)

        test_vs_expected(get_test_data("2fa", "initial"), "TwoFactorAuth")
        test_vs_expected(get_test_data("login", "failed"), "LoginError")

    # Are there multiple 2fa options to choose from
    # Working Jan2
    def test_2fa_action_type(self):
        twofa_datum = get_test_data("2fa", "initial")
        for key, image, expected in twofa_datum:
            print("Testing 2FA Options: " + key)
            detected = runQuery(image, query_page_2fa_action)
            expectedAction = "InputCode" if "input" in expected else "SelectDestination" if "select" in expected else "ApproveInApp"
            self.assertEqual(detected["action"], expectedAction)

    # If "SelectDestination" is chosen, are there multiple options to choose from
    # Working Jan2
    def test_2fa_select_dest(self):
        twofa_datum = get_single_test_element("2fa", "initial", "select")
        for key, image, expected in twofa_datum:
            # Can queries return an array of elements?
            detected = runQuery(image, query_page_2fa_destinations)

            # Single option (for now)
            phones = detected["phone_nos"]
            self.assertEqual(len(phones), 2)

            # copy originals
            validations = expected.copy()
            for phone in phones:
                #get_options_query = f"Analyze the provided webpage. Describe all the elements that will send a two-factor authentication code to {phone}. {json_part}"
                get_options_query = get_2fa_elements_for_phone(phone)
                detected = runQuery(image, get_options_query)
                # How to validate these?
                for element in detected["elements"]:
                    # one of these should pass, but we don't know which
                    passed = False
                    for o in validations:
                        try:
                            self.assertResponse(element, image, o, key)
                            passed = True
                            validations.remove(o)
                            break
                        except:
                            pass
                    self.assertTrue(passed)
                    
    # Detect the input for the 2FA code
    def test_2fa_input_page(self):
        # Test finding elements of the appropriate type on this page
        twofa_datum = get_test_data("2fa", "input")

        #query_2fa_input_element = f"Analyze the provided webpage. Describe the input for auth code. {get_instruct_json_respose(element_schema)}"
        test_element_type(self, "input", query_2fa_input_element, twofa_datum)
        # NOTE: The checkbox identifies the whole checkbox thingy, including the label.
        # This may not be accurate enough, we will need to potentially identify ways to narrow that scope
        #query_2fa_submit_element = f"Analyze the provided webpage. Describe the checkbox to remember the authentication code and skip next time. {get_instruct_json_respose(element_schema)}"
        test_element_type(self, "skip", query_2fa_skip_element, twofa_datum)
        #query_2fa_skip_element = f"Analyze the provided webpage. Describe the button to submit the authentication code. {get_instruct_json_respose(element_schema)}"
        test_element_type(self, "submit", query_2fa_submit_element, twofa_datum)


def test_element_type(test: TestBase, element_type: str, query, datum):
    for key, image, elements in datum:
        if (element_type not in elements):
            continue
        print(f"Testing {key} for {element_type}")
        element = runQuery(image, query)
        test.assertResponse(element, image, elements[element_type], key)
        
if __name__ == "__main__":
    unittest.main()

from TestBase import TestBase, runQuery
from testdata import get_test_data, get_single_test_element
from twofa_data import query_page_2fa_action, query_page_2fa_destinations, get_2fa_elements_for_phone, query_2fa_input_element, query_2fa_skip_element, query_2fa_submit_element

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

    # What is the action be requested of the user here?
    def test_2fa_action_type(self):
        twofa_datum = get_test_data("2fa", "initial")
        for key, image, expected in twofa_datum:
            with self.subTest(key=key):
                detected = runQuery(image, query_page_2fa_action)
                expectedAction = "InputCode" if "code" in expected else "SelectDestination" if "select" in expected else "ApproveInApp"
                self.assertEqual(detected["action"], expectedAction)

    # If "SelectDestination" is chosen, are there multiple options to choose from
    def test_2fa_select_dest(self):
        twofa_datum = get_single_test_element("2fa", "initial", "select")
        for key, image, expected in twofa_datum:
            with self.subTest(key=key):
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
                    
    def test_2fa_input_page(self):
        # (remember, data has changed for these and not yet been validated)
        twofa_datum = get_test_data("2fa", "input") + get_test_data("2fa", "initial")
        test_element_type(self, "code", query_2fa_input_element, twofa_datum)
        test_element_type(self, "remember", query_2fa_skip_element, twofa_datum)
        test_element_type(self, "submit", query_2fa_submit_element, twofa_datum)


def test_element_type(test: TestBase, element_type: str, query, datum):
    for key, image, elements in datum:
        if (element_type not in elements):
            continue
        with test.subTest(key=key, element_type=element_type):
            element = runQuery(image, query)
            test.assertResponse(element, image, elements[element_type], key)
        
if __name__ == "__main__":
    unittest.main()

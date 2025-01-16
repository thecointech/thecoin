from TestBase import TestBase
from testdata import get_test_data, get_single_test_element
from twofa_data import TwoFactorActions
from twofa_routes import (
    detect_action_required,
    detect_destinations,
    get_destination_elements,
    get_auth_input,
    get_remember_input,
    get_submit_input
)

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
    async def test_2fa_action_type(self):
        twofa_datum = get_test_data("TwoFactorAuth", "initial")
        for key, image, expected in twofa_datum:
            with self.subTest(key=key):
                response = await detect_action_required(image)
                expected_action = (
                    TwoFactorActions.INPUT_CODE if "input" in expected 
                    else TwoFactorActions.SELECT_DESTINATION if "select" in expected 
                    else TwoFactorActions.APPROVE_IN_APP
                )
                self.assertEqual(response.action, expected_action)

    # If "SelectDestination" is chosen, are there multiple options to choose from
    async def test_2fa_select_dest(self):
        twofa_datum = get_single_test_element("TwoFactorAuth", "initial", "select")
        for key, image, expected in twofa_datum:
            with self.subTest(key=key):
                # Get available phone numbers
                response = await detect_destinations(image)
                phones = response.phone_nos
                self.assertEqual(len(phones), 2)

                # copy originals
                validations = expected.copy()
                for phone in phones:
                    # Get elements for each phone number
                    elements_response = await get_destination_elements(image, phone)
                    # How to validate these?
                    for element in elements_response.elements:
                        # one of these should pass, but we don't know which
                        passed = False
                        for o in validations:
                            try:
                                self.assertResponse(element, o, key)
                                passed = True
                                validations.remove(o)
                                break
                            except AssertionError:
                                pass
                        self.assertTrue(passed, f"Failed to match element {element} in {key}")
                self.assertEqual(len(validations), 0, f"Failed to match all elements in {key}")

    async def test_2fa_input_element(self):
        await test_element_type(self, "input", get_auth_input)

    async def test_2fa_remember_element(self):
        await test_element_type(self, "remember", get_remember_input)

    async def test_2fa_submit_element(self):
        await test_element_type(self, "submit", get_submit_input)


async def test_element_type(test: TestBase, element_type: str, endpoint):
    data = get_test_data("TwoFactorAuth", "initial") + get_test_data("TwoFactorAuth", "input")
    for key, image, expected in data:
        if (element_type not in expected):
            continue
        with test.subTest(key=key):
            response = await endpoint(image)
            test.assertResponse(response, expected[element_type], key)

if __name__ == "__main__":
    unittest.main()

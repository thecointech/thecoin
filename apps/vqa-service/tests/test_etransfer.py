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
# Find ETransfer link
#   (Navigate)
# Detect page intent (PayBill/SendTransfer)
#   (Detect the inputs required?)
# Find 'amount' input
#   (Enter amount)
# Find 'to' input
#   (Enter to address)
# Validate selection
#   (Click on correct select option)


# Find 

class TestETransfer(TestBase):

    # What is the action be requested of the user here?
    async def test_navigate_to_transfer(self):
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

if __name__ == "__main__":
    unittest.main()

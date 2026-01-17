import re
from typing import Callable, List
from TestBase import TestBase
from tests.testutils.testdata import TestData
from tests.testutils.types import TestElmData
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

    section = "TwoFA"
    record_time = "archive"

    # What is the action be requested of the user here?
    async def test_action_required(self):

        async def test(test: TestData):
            response = await detect_action_required(test.image)
            expected_action = (
                TwoFactorActions.INPUT_CODE if any(elm['name'] == "code" for elm in test.elements)
                else TwoFactorActions.SELECT_DESTINATION if any(elm['name'] == "destination" for elm in test.elements)
                else TwoFactorActions.APPROVE_IN_APP
            )
            self.assertEqual(response.action, expected_action)

        await self.run_subTests_TestData("{code,destination,approve-in-app}", test_func=test)


    # If "SelectDestination" is chosen, are there multiple options to choose from
    async def test_detect_dest(self):
        async def test(test: TestData):
            # Get available phone numbers
            response = await detect_destinations(test.image)
            phones = response.phones.phone_nos
            self.assertEqual(len(phones), 2)
            expected_phones = [elm for elm in test.elm_iter("phone")]

            for phone in phones:
                with self.subTest(phone=phone.phone_number):
                    def assert_cb(elm: TestElmData):
                        self.assertPosition(phone, elm.data)
                        # The text can be very different due to the LLM having difficulty with masking
                        # Just test that the numbers present are the same
                        elm_digits = "".join(re.findall(r"\d+", elm.data["text"]))
                        phone_digits = "".join(re.findall(r"\d+", phone.phone_number))
                        self.assertEqual(elm_digits, phone_digits)

                    self.assertInArray(expected_phones, assert_cb)

        await self.run_subTests_TestData("destination", test)

    # If "SelectDestination" is chosen, are there multiple options to choose from
    async def test_detect_dest_elements(self):
        async def test(test: TestData):
            original_responses = [t.response for t in test.vqa_iter("getDestinationElements")]
            original_buttons = [b for t in original_responses for b in t["buttons"]]
            for elm in test.elm_iter("phone"):
                # Rebuild query from source, this will include overrides automatically
                data = elm.data
                elements_response = await get_destination_elements(test.image, data["text"],data["coords"]["top"], data["coords"]["left"], data["coords"]["width"], data["coords"]["height"])
                print(elements_response)
                # We don't have elements to test this, so just verify the response matches the original
                for button in elements_response.buttons:
                    with self.subTest(phone=data["text"], button=button.content):
                        def assert_cb(elm):
                            self.assertEqual(button.content, elm["content"])
                            # we allow some variance in the position of the element
                            self.assertAlmostEqual(button.position_x, elm["position_x"], delta=30)
                            self.assertAlmostEqual(button.position_y, elm["position_y"], delta=10)

                        self.assertInArray(original_buttons, assert_cb)

        await self.run_subTests_TestData("getDestinationElements", test)

    async def test_input_element(self):
        await self.run_subTests_Elements("code", get_auth_input)

    async def test_remember_element(self):
        await self.run_subTests_Elements("remember", get_remember_input, "getRememberInput")

    async def test_submit_element(self):
        await self.run_subTests_Elements("submit", get_submit_input, "getSubmitInput")

    def assertInArray(self, expected_array: List[TestElmData], callback: Callable[[TestElmData], None]) -> None:
        found = False
        for elm in expected_array:
            try:
                callback(elm)
                found = True
                expected_array.remove(elm)
                break
            except AssertionError:
                pass
        self.assertTrue(found, "Failed to match element in array")

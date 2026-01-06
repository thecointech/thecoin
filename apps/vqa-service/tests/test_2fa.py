import re
from typing import Awaitable, Callable, List
from TestBase import TestBase
from data_elements import ElementResponse
from testutils.testdata import get_test_data, TestElmData
from twofa_data import TwoFactorActions
from fastapi import UploadFile
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
        tests = get_test_data("TwoFA", "{code,destination,approve-in-app}", "archive")
        # note: we do not have a sample for approve-in-app
        for test in tests:
            with self.subTest(key=test.key):
                response = await detect_action_required(test.image())
                expected_action = (
                    TwoFactorActions.INPUT_CODE if any("code" in elm for elm in test.elements)
                    else TwoFactorActions.SELECT_DESTINATION if any("destination" in elm for elm in test.elements)
                    else TwoFactorActions.APPROVE_IN_APP
                )
                self.assertEqual(response.action, expected_action)

    # If "SelectDestination" is chosen, are there multiple options to choose from
    async def test_2fa_select_dest(self):
        tests = get_test_data("TwoFA", "destination", "archive")
        for test in tests:

            with self.subTest(key=test.key):
                # Get available phone numbers
                response = await detect_destinations(test.image())
                phones = response.phones.phone_nos
                self.assertEqual(len(phones), 2)
                expected_phones = [elm for elm in test.elm_iter("phone")]

                for phone in phones:
                    with self.subTest(phone=phone.phone_number):
                        def assert_cb(elm: TestElmData):
                            self.assertPosition(phone, elm)
                            # The text can be very different due to the LLM having difficulty with masking
                            # Just test that the numbers present are the same
                            elm_digits = "".join(re.findall(r"\d+", elm['text']))
                            phone_digits = "".join(re.findall(r"\d+", phone.phone_number))
                            self.assertEqual(elm_digits, phone_digits)

                        self.assertInArray(expected_phones, assert_cb)

    # If "SelectDestination" is chosen, are there multiple options to choose from
    async def test_2fa_detect_dest_elements(self):
        tests = get_test_data("TwoFA", "getDestinationElements", "archive")
        for test in tests:
            with self.subTest(key=test.key):
                original_responses = [t.response for t in test.vqa_iter("getDestinationElements")]
                original_buttons = [b for t in original_responses for b in t["buttons"]]
                for elm in test.elm_iter("phone"):
                    # Rebuild query from source, this will include overrides automatically
                    elements_response = await get_destination_elements(test.image(), elm["text"],elm["coords"]["top"], elm["coords"]["left"], elm["coords"]["width"], elm["coords"]["height"])
                    print(elements_response)
                    # We don't have elements to test this, so just verify the response matches the original
                    for button in elements_response.buttons:
                        with self.subTest(phone=elm["text"], button=button.content):
                            def assert_cb(elm):
                                self.assertEqual(button.content, elm["content"])
                                # we allow some variance in the position of the element
                                self.assertAlmostEqual(button.position_x, elm["position_x"], delta=30)
                                self.assertAlmostEqual(button.position_y, elm["position_y"], delta=10)

                            self.assertInArray(original_buttons, assert_cb)

    async def test_2fa_input_element(self):
        await test_element_type(self, "code", get_auth_input)

    async def test_2fa_remember_element(self):
        await test_element_type(self, "remember", get_remember_input, 30)

    async def test_2fa_submit_element(self):
        await test_element_type(self, "submit", get_submit_input)

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


async def test_element_type(base: TestBase, element_type: str, endpoint: Callable[[UploadFile], Awaitable[ElementResponse]], tolerance=5):
    tests = get_test_data("TwoFA", element_type, "archive")
    for test in tests:
        with base.subTest(key=test.key):
            response = await endpoint(test.image())
            elm = test.elm(element_type)
            base.assertResponse(response, elm, tolerance)



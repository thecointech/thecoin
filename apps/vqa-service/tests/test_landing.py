# A suite of tests for the Molmo VQA MLLM
import unittest
from TestBase import TestBase
from geo_math import BBox
from intent_routes import page_intent
from landing_routes import (
    navigate_to_login,
    navigate_to_login_menu
)

# Our process goes
# 2 If Landing, find login button
#   2.1 Click button
#   2.2 Detect Page Intent
#   2.3 Goto 2
class TestLanding(TestBase):
    section = "Landing"
    record_time = "archive"

    async def test_finds_login_button(self):
        await self.verify_elements(
            "login",
            "navigateToLogin",
            endpoint=navigate_to_login,
            # Gold tests are old, so skip them
            skip_if= lambda test: 'archive/gold/' in test.key
        )

    # NOTE: This test doesn't have any data, possibly because
    # we have not tested a target with menu login since writing it(?)
    async def test_finds_login_button_in_menu(self):
        async def run_test(test):
            intent = await page_intent(test.image)
            self.assertEqual(intent.type, "MenuSelect", "Login intent failed for " + test.key)
            response = await navigate_to_login_menu(test.image, BBox(bottom=770))
            self.assertResponse(response, test, "login")
        await self.run_subtests(run_test, "menu")


if __name__ == "__main__":
    unittest.main()

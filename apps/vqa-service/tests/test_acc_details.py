from TestBase import TestBase
import unittest
from tests.repeat_on_failure import repeat_on_fail
from tests.testdata import get_single_test_element, get_test_data
from intent_routes import page_intent
from credit_details_routes import (
    current_balance,
    current_pending,
    current_due_amount,
    current_due_date
)

class TestReadAccountDetails(TestBase):

    async def test_intent(self):
        test_data = get_single_test_element("AccountDetails", "initial", "intent")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await page_intent(image)
                self.assertEqual(response.type, expected["intent"])

    @repeat_on_fail
    async def test_find_current_balance(self):
        test_data = get_single_test_element("AccountDetails", "initial", "balance", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await current_balance(image)
                self.assertResponse(response, expected)

    async def test_find_pending_amount(self):
        test_data = get_single_test_element("AccountDetails", "initial", "pending", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await current_pending(image)
                self.assertEqual(response.pending_exists, True, f"Pending exists not matched for {key}")
                if response.pending_exists:
                    self.assertResponse(response.pending_element, expected)

    @repeat_on_fail
    async def test_find_due_amount(self):
        test_data = get_single_test_element("AccountDetails", "initial", "due", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await current_due_amount(image)
                self.assertResponse(response, expected)

    @repeat_on_fail
    async def test_find_due_date(self):
        test_data = get_single_test_element("AccountDetails", "initial", "dueDate", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = await current_due_date(image)
                self.assertResponse(response, expected)


if __name__ == '__main__':
    unittest.main()
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

class TestCreditAccountDetails(TestBase):

    async def test_find_current_balance(self):
        samples = get_single_test_element("CreditAccountDetails", "balance", 800)
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await current_balance(sample.image)
                self.assertResponse(response, sample.element, sample.key)

    async def test_find_pending_amount(self):
        samples = get_single_test_element("CreditAccountDetails", "pending", 800)
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await current_pending(sample.image)
                self.assertEqual(response.pending_exists, True, f"Pending exists not matched for {sample.key}")
                if response.pending_exists:
                    self.assertResponse(response.pending_element, sample.element, sample.key)

    async def test_find_due_amount(self):
        samples = get_single_test_element("CreditAccountDetails", "dueAmount", 800)
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await current_due_amount(sample.image)
                self.assertResponse(response, sample.element, sample.key)

    async def test_find_due_date(self):
        samples = get_single_test_element("CreditAccountDetails", "dueDate", 800)
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await current_due_date(sample.image)
                self.assertDateResponse(response, sample.element, sample.key)


if __name__ == '__main__':
    unittest.main()

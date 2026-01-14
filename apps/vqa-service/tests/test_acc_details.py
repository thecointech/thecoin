from TestBase import TestBase
import unittest
from credit_details_routes import (
    current_balance,
    current_pending,
    current_due_amount,
    current_due_date
)
from data_elements import PositionResponse
from tests.testutils.testdata import TestData

class TestCreditAccountDetails(TestBase):

    section = "CreditAccountDetails"
    record_time = "archive"

    async def test_find_current_balance(self):
        await self.verify_elements("balance", endpoint=current_balance)


    async def test_find_pending_amount(self):
        async def test_find_pending(test: TestData):
            response = await current_pending(test.image)
            self.assertEqual(response.pending_exists, True, f"Pending exists not matched")
            if response.pending_exists:
                vqa = lambda: PositionResponse(**test.vqa("currentPending").response["pending_element"])
                self.assertResponse(response.pending_element, test, "pending", vqa=vqa)
        await self.verify_elements("pending", test_func=test_find_pending)


    async def test_find_due_amount(self):
        await self.verify_elements("dueAmount", endpoint=current_due_amount, vqa="currentDueAmount")


    async def test_find_due_date(self):
        async def test_find_due_date(test: TestData):
            response = await current_due_date(test.image)
            self.assertDateResponse(response, test.elm("dueDate"), vqa=lambda: PositionResponse(**test.vqa("currentDueDate").response))
        await self.verify_elements("dueDate", test_func=test_find_due_date)


if __name__ == '__main__':
    unittest.main()

from TestBase import TestBase
import unittest
from query import runQuery
from intent_data import query_page_intent
from tests.repeat_on_failure import repeat_on_fail
from tests.testdata import get_single_test_element, get_test_data
# from data_elements import element_schema
from credit_details_data import query_current_balance_element, query_pending_balance_element, query_due_amount_element, query_due_date_element

class TestReadAccountDetails(TestBase):

    # @repeat_on_fail
    # def test_find_details_area(self):
    #     test_data = get_single_test_element("AccountDetails", "initial", "balance")
    #     # check all landing pages
    #     for key, image, expected in test_data:

    #         json_part = request_json + f"{{ \"top\": \"number\", \"left\": \"number\", \"width\": \"number\", \"height\": \"number\", }} }}"

    #         find_details_area_query = f"Analyze this credit card account. Describe the area that contains account details like balance, due date, and due amount. {json_part}"
    #         response = runQuery(find_details_area_query, image)
    #         self.assertResponse(response, expected, f"Current balance {key}")

    def test_intent(self):
        test_data = get_single_test_element("AccountDetails", "initial", "intent")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                intent = runQuery(image, query_page_intent)
                self.assertEqual(intent["type"], expected["intent"])

    @repeat_on_fail
    def test_find_current_balance(self):
        test_data = get_single_test_element("AccountDetails", "initial", "balance", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = runQuery(image, query_current_balance_element)
                self.assertResponse(response, expected)

    def test_find_pending_amount(self):
        test_data = get_single_test_element("AccountDetails", "initial", "pending", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = runQuery(image, query_pending_balance_element)
                self.assertEqual(response["pending_exists"], True, "Pending exists not matched for " + key)
                if response["pending_exists"]:
                    self.assertResponse(response["pending_element"], expected)

    @repeat_on_fail
    def test_find_due_amount(self):
        test_data = get_single_test_element("AccountDetails", "initial", "due-amount", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = runQuery(image, query_due_amount_element)
                self.assertResponse(response, expected)

    @repeat_on_fail
    def test_find_due_date(self):
        test_data = get_single_test_element("AccountDetails", "initial", "due-date", 800)
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = runQuery(image, query_due_date_element)
                self.assertDateResponse(response, expected)

    # Reading history is super-complicated.  We should try and use the download function instead
    # @repeat_on_fail
    # def test_find_history(self):
    #     test_data = get_single_test_element("AccountDetails", "initial", "pending", 2000)
    #     json_part = get_instruct_json_respose(element_schema)
    #     for key, image, expected in test_data:
    #         json_part = request_json + f"{{ \"num_rows\": \"number\", \"history\": [{get_model_example(element_schema)}] }}"
    #         find_history_query = f"Analyze the provided credit card account. Describe the transaction history. {json_part}"
    #         response = runQuery(find_history_query, image)
    #         print("Found " + str(response["num_rows"]) + " rows in " + key)
    #         # self.assertResponse(response, expected["history"], f"History {key}")

if __name__ == '__main__':
    unittest.main()
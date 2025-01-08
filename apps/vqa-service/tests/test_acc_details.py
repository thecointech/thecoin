from TestBase import TestBase, repeat_on_fail
import unittest

from helpers import get_instruct_json_respose, request_json
from query import runQuery
from tests.testdata import get_single_test_element, get_test_data
# from data_elements import element_schema
from credit_details_data import query_current_balance_element, query_pending_balance_element, query_due_amount_element, query_due_date_element

class TestReadAccountDetails(TestBase):

    # @repeat_on_fail
    # def test_find_details_area(self):
    #     test_data = get_single_test_element("details", "", "balance")
    #     # check all landing pages
    #     for key, image, expected in test_data:

    #         json_part = request_json + f"{{ \"top\": \"number\", \"left\": \"number\", \"width\": \"number\", \"height\": \"number\", }} }}"

    #         find_details_area_query = f"Analyze this credit card account. Describe the area that contains account details like balance, due date, and due amount. {json_part}"
    #         response = runQuery(find_details_area_query, image)
    #         self.assertResponse(response, image, expected, f"Current balance {key}")

    def test_find_current_balance(self):
        test_data = get_single_test_element("details", "", "balance", 800)
        # json_part = get_instruct_json_respose(element_schema)
        # check all landing pages
        for key, image, expected in test_data:
            # find_current_balance_query = f"Analyze this credit card account. Describe the element that contains the current balance amount. {json_part}"
            response = runQuery(image, query_current_balance_element)
            self.assertResponse(response, image, expected, f"Current balance {key}")

    def test_find_pending_amount(self):
        test_data = get_single_test_element("details", "", "pending", 800)
        # json_part = get_instruct_json_respose(element_schema)
        # check all landing pages
        for key, image, expected in test_data:
            # pending_json_part = request_json + f"{{ \"pending_exists\": \"boolean\", \"pending_element\": {{ \"content\": \"dollar amount\", \"neighbour_text\": \"Text immediately beside or above the element\", \"font_color\": \"#FFFFFF\", \"background_color\": \"#FFFFFF\", \"position_x\": \"number\", \"position_y\": \"number\"}} }}"
            # find_pending_balance_query = f"Analyze the provided credit card details webpage. Is there an amount pending? {pending_json_part}"
            response = runQuery(image, query_pending_balance_element)
            self.assertEqual(response["pending_exists"], True, "Pending exists not matched for " + key)
            if response["pending_exists"]:
                self.assertResponse(response["pending_element"], image, expected, f"Pending {key}")
        
    def test_find_due_amount(self):
        test_data = get_single_test_element("details", "", "due-amount", 800)
        # json_part = get_instruct_json_respose(element_schema)
        # check all landing pages
        for key, image, expected in test_data:
            # find_due_amount_query = f"Analyze the provided credit card details webpage. Describe amount due for the previous period. {json_part}"
            response = runQuery(image, query_due_amount_element)
            self.assertResponse(response, image, expected, f"Due amount {key}")

    def test_find_due_date(self):
        test_data = get_single_test_element("details", "", "due-date", 800)
        #json_part = get_instruct_json_respose(element_schema)
        #json_part = request_json + f"{{ \"content\": \"date string\", \"neighbour_text\": \"Text immediately beside or above the element\", \"font_color\": \"#FFFFFF\", \"background_color\": \"#FFFFFF\", \"position_x\": \"number\", \"position_y\": \"number\"}}"
        # check all landing pages
        for key, image, expected in test_data:
            # find_due_date_query = f"Analyze the provided credit card details webpage. Describe the element that contains the due date. {json_part}"
            response = runQuery(image, query_due_date_element)
            self.assertResponse(response, image, expected, f"Due date {key}")

    # Reading history is super-complicated.  We should try and use the download function instead
    # @repeat_on_fail
    # def test_find_history(self):
    #     test_data = get_single_test_element("details", "", "pending", 2000)
    #     json_part = get_instruct_json_respose(element_schema)
    #     for key, image, expected in test_data:
    #         json_part = request_json + f"{{ \"num_rows\": \"number\", \"history\": [{get_model_example(element_schema)}] }}"
    #         find_history_query = f"Analyze the provided credit card account. Describe the transaction history. {json_part}"
    #         response = runQuery(find_history_query, image)
    #         print("Found " + str(response["num_rows"]) + " rows in " + key)
    #         # self.assertResponse(response, image, expected["history"], f"History {key}")

if __name__ == '__main__':
    unittest.main()
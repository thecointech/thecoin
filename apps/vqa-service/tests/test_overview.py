from TestBase import TestBase, repeat_on_fail
from testdata import get_test_data, get_single_test_element, get_nested
from helpers import get_instruct_json_respose, element_schema, get_model_example, request_json, cast_value
from query import runQuery
from query_page_intent import intent_prompt
from thefuzz import fuzz

class TestOverview(TestBase):

    # Tested: working
    def test_overview_page_intent(self):
        # get landing pages
        # All pages are required to have an intent, so don't filter them out here
        test_datum = get_test_data("overview", "")

        # check all landing pages
        for key, image, expected in test_datum:
            intent = runQuery(intent_prompt, image)
            self.assertEqual(intent["type"], expected["intent"]["intent"], "Overview intent failed for " + key)

    def test_overview_list_accounts(self):
        # get landing pages
        # All pages are required to have an intent, so don't filter them out here
        test_datum = get_single_test_element("overview", "", "list-accounts")

        json_part = request_json + f"{{ \"num_accounts\": \"number\", \"accounts\": [{{\"account_type\": \"Chequing|Savings|Credit\", \"account_number\": \"string\", \"balance\": \"string\", \"position_x\": \"number\", \"position_y\": \"number\" }}] }}"
        list_accounts_query = f"Analyze the provided webpage. How many bank accounts with a balance does the user have? {json_part}"
                    
        # check all landing pages
        for key, image, expected in test_datum:
            rough_response = runQuery(list_accounts_query, image)
            self.assertEqual(rough_response["num_accounts"], len(expected), "Mismatched accounts length in list accounts " + key)

            accounts = rough_response["accounts"]
            self.assertEqual(len(accounts), len(expected), "Mismatched accounts length in list accounts " + key)

            validations = expected.copy()
            for account in accounts:
                # Find the closest from src data
                scored_valid = [(valid, fuzz.partial_ratio(account["account_number"], valid["text"])) for valid in validations]
                (vacc, score) = max(scored_valid, key=lambda x: x[1])

                # Validate basic data.  Keep a very low score, as we don't really care.  Hopefully the accuracy
                # improves if/when we get to use a higher-precision model
                self.assertGreaterEqual(score, 30, "Did not find account number in list accounts " + key)   
                self.assertIn(account["balance"], vacc["siblingText"], "Did not find balance in list accounts " + key)
                accountType = get_nested(vacc, "extra", "accountType")
                if (accountType):
                    self.assertEqual(account["account_type"], accountType, "Account type not matched in list accounts " + key)
                else:
                    self.assertIn(account["account_type"], vacc["text"], "Did not find account type in list accounts " + key)

                # Do we care about position?  It'd be nice to have, but it seems to fail
                # If/when we need to identify an element specifically it will probably be better
                # to identify that element specifically rather than via list like this
                # self.assertPosition(account, image, vacc, key)
                validations.remove(vacc)
            print("All accounts matched in list accounts " + key)

    @repeat_on_fail
    def test_find_link_to_account(self):
        pass
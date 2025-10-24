from TestBase import TestBase, normalize
from testutils.testdata import get_test_data
from thefuzz import fuzz
from tests.repeat_on_failure import repeat_on_fail
from summary_routes import account_balance_element, list_accounts, account_navigate_element
from intent_routes import page_intent


class TestSummary(TestBase):

    async def test_overview_list_accounts(self):
        # get landing pages
        # All pages are required to have an intent, so don't filter them out here
        tests = get_test_data("AccountsSummary", "listAccounts")

        # check all landing pages
        for test in tests:
            with self.subTest(key=test.key):
                vqa = test.vqa("listAccounts")

                rough_response = await list_accounts(test.image())
                self.assertEqual(rough_response.num_accounts, vqa.response["num_accounts"], "Mismatched accounts length in list accounts ")

                accounts = rough_response.accounts
                self.assertEqual(len(accounts), rough_response.num_accounts, "Mismatched accounts length in list accounts")

                validations = [test.elm("account").data for i in range(rough_response.num_accounts)]

                for account in accounts:
                    # Find the closest from src data
                    scored_valid = [(valid, fuzz.partial_ratio(account.account_number, valid["text"])) for valid in validations]
                    (vacc, score) = max(scored_valid, key=lambda x: x[1])

                    # Validate basic data.  Keep a very low score, as we don't really care.  Hopefully the accuracy
                    # improves if/when we get to use a higher-precision model
                    self.assertGreaterEqual(score, 30, "Did not find account number in list accounts")
                    siblings = [normalize(s) for s in vacc["siblingText"]]
                    balanceMatched = (
                        normalize(account.balance) in siblings or
                        normalize(account.balance + ".00") in siblings # Handle LLM shortning $200.00 to $200
                    )
                    self.assertTrue(balanceMatched, f"Did not find {account.balance} in {siblings}")

                    accountTypes = [account.account_type.lower()]
                    if (accountTypes[0] == "credit"):
                        accountTypes.extend(["visa", "mastercard"])
                    accountName = vacc["text"].lower()
                    self.assertTrue(any(account_type in accountName for account_type in accountTypes), f"{accountTypes} not found in {accountName}")

                    # Do we care about position?  It'd be nice to have, but it seems to fail
                    # If/when we need to identify an element specifically it will probably be better
                    # to identify that element specifically rather than via list like this
                    # self.assertPosition(account, image, vacc, key)
                    validations.remove(vacc)
                print("All accounts matched in list accounts")

    async def test_find_account_balance(self):
        tests = get_test_data("AccountsSummary", "accountBalance")

        for test in tests:
            with self.subTest(key=test.key):
                vqa = test.vqa("accountBalance")
                response = await account_balance_element(test.image(), vqa.args[0], int(vqa.args[1]), int(vqa.args[2]))
                elm = test.elm("balance")
                self.assertResponse(response, elm)

    async def test_find_navigate_to_account(self):
        tests = get_test_data("AccountsSummary", "NavigateElement")

        for test in tests:
            with self.subTest(key=test.key):
                accounts = test.vqa("listAccounts")
                for i in range(accounts.response["num_accounts"]):
                    vqa = test.vqa("NavigateElement")
                    response = await account_navigate_element(test.image(), *vqa.args)
                    elm = test.elm("navigate")
                    self.assertResponse(response, elm)

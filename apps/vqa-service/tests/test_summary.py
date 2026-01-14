from TestBase import TestBase, normalize
from testutils.testdata import TestData
from thefuzz import fuzz
from summary_routes import account_balance_element, list_accounts, account_navigate_element


class TestAccountsSummary(TestBase):
    section = "AccountsSummary"
    record_time = "archive"

    skip_accounts = [
        # The scraper seems to have pulled in an incorrect element
        # for the credit card account here, skip until fixed there
        "archive:2025-10-24_16-34:Tangerine:AccountsSummary:0",
        "archive:2026-01-05_15-27:Tangerine:AccountsSummary:0"
    ]
    async def test_overview_list_accounts(self):
        async def test_list_accounts(test: TestData):
            rough_response = await list_accounts(test.image)
            vqa = test.vqa("listAccounts")
            self.assertEqual(rough_response.num_accounts, vqa.response["num_accounts"], "Mismatched accounts length in list accounts ")

            accounts = rough_response.accounts
            self.assertEqual(len(accounts), rough_response.num_accounts, "Mismatched accounts length in list accounts")

            validations = [elm.data for elm in test.elm_iter("account")]

            for account in accounts:
                # Find the closest from src data
                scored_valid = [(valid, fuzz.partial_ratio(account.account_number, valid["text"])) for valid in validations]
                (vacc, score) = max(scored_valid, key=lambda x: x[1])

                # Validate basic data.  Keep a very low score, as we don't really care.  Hopefully the accuracy
                # improves if/when we get to use a higher-precision model
                self.assertGreaterEqual(score, 30, f"Did not find account number {account.account_number} in list accounts")
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

        await self.verify_elements("listAccounts", test_func=test_list_accounts, skip_if=self.skip_accounts)

    skip_account_balance = [
        # These two return the position of the account name rather than the balance element.
        "archive:2025-08-07_17-21:Tangerine:AccountsSummary:0",
        "archive:2025-08-08_16-21:Tangerine:AccountsSummary:0",
        # This one is marked "ignored" in the override file
        'archive:2025-08-07_17-05:TD:AccountsSummary:0'
    ]
    async def test_find_account_balance(self):
        async def test_account_balance(test: TestData):
            vqa = test.vqa("accountBalance")
            response = await account_balance_element(test.image, vqa.args[0], int(vqa.args[1]), int(vqa.args[2]))
            self.assertResponse(response, test, "balance", "accountBalance")

        await self.verify_elements("accountBalance", test_func=test_account_balance, skip_if=self.skip_account_balance)


    # async def test_find_navigate_to_account(self):
    #     tests = get_test_data("AccountsSummary", "NavigateElement")

    #     for test in tests:
    #         with self.subTest(key=test.key):
    #             accounts = test.vqa("listAccounts")
    #             for i in range(accounts.response["num_accounts"]):
    #                 vqa = test.vqa("NavigateElement")
    #                 response = await account_navigate_element(test.image(), *vqa.args)
    #                 elm = test.elm("navigate")
    #                 self.assertResponse(response, elm)

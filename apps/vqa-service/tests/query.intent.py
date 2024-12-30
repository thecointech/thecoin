
import unittest
from testdata import get_test_data
from runQuery import runQuery  # noqa: E402
from helpers import normalize

query_intent = " From the following options, select the one that best describes the given webpage: Landing, Login, AccountSelect, AccountDetails, PayBill, SendTransfer, ModalDialog, ErrorMessage. Return only valid JSON data in the following format: {\"type\": \"option\"}"


class QueryLoginIntentTests(unittest.TestCase):
    def test_detect_login_page(self):
        # get landing pages
        test_datum = get_test_data("login")

        # check all landing pages
        for key, (image, _original) in test_datum.items():
            if ("failed" in key or "Random" in key):
                continue
            print("Testing Login intent for: " + key)
            intent = runQuery(query_intent, image)
            self.assertEqual(normalize(intent["type"]), "login")


if __name__ == "__main__":
    unittest.main()

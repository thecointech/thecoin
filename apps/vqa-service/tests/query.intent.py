
import unittest
from testdata import get_test_data
from queries import runQuery
from validate import normalize
from query_page_intent import intent_prompt  # noqa: E402

class QueryLoginIntentTests(unittest.TestCase):
    def test_detect_login_page(self):
        # get landing pages
        test_datum = get_test_data("login")

        # check all landing pages
        for key, (image, _original) in test_datum.items():
            if ("failed" in key or "Random" in key):
                continue
            print("Testing Login intent for: " + key)
            intent = runQuery(intent_prompt, image)
            self.assertEqual(normalize(intent["type"]), "login")


if __name__ == "__main__":
    unittest.main()



from TestBase import TestBase, runQuery
from intent_data import PageType, IntentResponse, query_page_intent
from testdata import get_test_data


class TestIntentProcess(TestBase):

    def test_case_insensitive_page_type(self):
        # Test that different casings of the same value work
        assert IntentResponse(type="Landing").type == PageType.LANDING
        assert IntentResponse(type="landing").type == PageType.LANDING
        assert IntentResponse(type="LANDING").type == PageType.LANDING
        assert IntentResponse(type="LaNdInG").type == PageType.LANDING


    def test_page_intents(self):
        test_data = get_test_data("Intents", "")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                response = runQuery(image, query_page_intent)
                self.assertResponse(response, expected)
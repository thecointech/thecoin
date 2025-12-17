from TestBase import TestBase
from intent_data import PageType, IntentResponse
from testdata import get_single_test_element
from intent_routes import page_intent

class TestIntentProcess(TestBase):

    def test_case_insensitive_page_type(self):
        # Test that different casings of the same value work
        assert IntentResponse(type="Landing").type == PageType.LANDING
        assert IntentResponse(type="landing").type == PageType.LANDING
        assert IntentResponse(type="LANDING").type == PageType.LANDING
        assert IntentResponse(type="LaNdInG").type == PageType.LANDING


    async def test_page_intents(self):
        samples = get_single_test_element("*", "intent")
        for sample in samples:
            with self.subTest(key=sample.key):
                response = await page_intent(sample.image)
                self.assertEqual(response.type, sample.element.vqa["intent"],
                               f"Intent mismatch for {sample.key}")

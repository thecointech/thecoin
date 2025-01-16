from TestBase import TestBase
from intent_data import PageType, IntentResponse
from testdata import get_test_data
from intent_routes import page_intent

class TestIntentProcess(TestBase):

    def test_case_insensitive_page_type(self):
        # Test that different casings of the same value work
        assert IntentResponse(type="Landing").type == PageType.LANDING
        assert IntentResponse(type="landing").type == PageType.LANDING
        assert IntentResponse(type="LANDING").type == PageType.LANDING
        assert IntentResponse(type="LaNdInG").type == PageType.LANDING

    async def test_page_intents(self):
        test_data = get_test_data("Intents", "")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                # Call the endpoint directly
                response = await page_intent(image)
                self.assertEqual(response.type, expected["intent"]["intent"], 
                               f"Intent mismatch for {key}")
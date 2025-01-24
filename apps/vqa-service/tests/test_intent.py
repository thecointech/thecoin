from TestBase import TestBase
from intent_data import PageType, IntentResponse
from testdata import get_test_data
from intent_routes import page_intent
from run_endpoint_query import MAX_RESOLUTION, Box

class TestIntentProcess(TestBase):

    def test_case_insensitive_page_type(self):
        # Test that different casings of the same value work
        assert IntentResponse(type="Landing").type == PageType.LANDING
        assert IntentResponse(type="landing").type == PageType.LANDING
        assert IntentResponse(type="LANDING").type == PageType.LANDING
        assert IntentResponse(type="LaNdInG").type == PageType.LANDING

    def test_crop(self):
        crop = Box(bottom=770)
        assert crop.right == MAX_RESOLUTION
        crop = Box(left=1, top=2, right=3, bottom=4)
        assert crop.top == 2


    async def test_page_intents(self):
        test_data = get_test_data("Intents", "")
        for key, image, expected in test_data:
            with self.subTest(key=key):
                # Call the endpoint directly
                response = await page_intent(image)
                self.assertEqual(response.type, expected["intent"]["intent"], 
                               f"Intent mismatch for {key}")
from TestBase import TestBase
from intent_data import PageType, IntentResponse
from intent_routes import page_intent

class TestIntentProcess(TestBase):

    section = "*"
    record_time = "archive"

    def test_case_insensitive_page_type(self):
        # Test that different casings of the same value work
        assert IntentResponse(type="Landing").type == PageType.LANDING
        assert IntentResponse(type="landing").type == PageType.LANDING
        assert IntentResponse(type="LANDING").type == PageType.LANDING
        assert IntentResponse(type="LaNdInG").type == PageType.LANDING


    async def test_page_intents(self):
        await self.run_subTests_Vqa("pageIntent", page_intent)



from TestBase import TestBase
from intent_data import PageType, IntentResponse


class TestIntentProcess(TestBase):

    def test_case_insensitive_page_type(self):
        # Test that different casings of the same value work
        assert IntentResponse(type="Landing").type == PageType.LANDING
        assert IntentResponse(type="landing").type == PageType.LANDING
        assert IntentResponse(type="LANDING").type == PageType.LANDING
        assert IntentResponse(type="LaNdInG").type == PageType.LANDING
import unittest
from TestBase import TestBase
from testutils.testdata import TestData, get_test_data
from login_routes import (
    detect_logout_element,
)
from tests.repeat_on_failure import repeat_on_fail


class TestLogout(TestBase):
    section = "Logout"
    record_time = "archive"

    async def test_logout_element(self):
        await self.verify_elements(
            "logout",
            endpoint=detect_logout_element,
            vqa="detectLogoutElement"
        )

if __name__ == "__main__":
    unittest.main()

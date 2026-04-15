import unittest
from TestBase import TestBase
from login_routes import (
    detect_logout_element,
)

class TestLogout(TestBase):
    section = "Logout"
    record_time = "archive"

    async def test_logout_element(self):
        await self.run_subTests_Elements(
            "logout",
            endpoint=detect_logout_element,
            vqa="detectLogoutElement"
        )

    # detectSessionTimeout is tested within eTransfer tests

if __name__ == "__main__":
    unittest.main()

import unittest
from TestBase import TestBase
from landing_routes import (
    cookie_banner_present,
    cookie_banner_accept,
)

# Our process goes
# 1. Is Cookie banner present?
#   1.1 Is there a cookie accept button?

class TestCookieBanner(TestBase):
    section = "CookieBanner"
    record_time = "archive"

    async def test_cookie_banner_present(self):
        async def test(test):
            response = await cookie_banner_present(test.image)
            expected = any(e["name"] == "cookie-accept" for e in test.elements)
            if (response.cookie_banner_detected != expected):
                # if reality & VQA don't line up, then at least we should
                # be the same as the last run (this affects TD post-accept)
                vqa = test.vqa("cookieBannerPresent")
                self.assertEqual(response.cookie_banner_detected, vqa.response["cookie_banner_detected"])

        await self.run_subTests_TestData("*", test_func=test)


    async def test_cookie_accept(self):
        await self.run_subTests_Elements(
            "cookie-accept",
            endpoint=cookie_banner_accept,
            vqa= "cookieBannerAccept",
        )


if __name__ == "__main__":
    unittest.main()

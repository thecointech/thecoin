import json

from TestBase import TestBase
from testdata import get_private_folder
from etransfer_routes import best_etransfer_link

# General flow
# Find ETransfer link
#   (Navigate)
# Detect page intent (PayBill/SendTransfer)
#   (Detect the inputs required?)
# Find 'amount' input
#   (Enter amount)
# Find 'to' input
#   (Enter to address)
# Validate selection
#   (Click on correct select option)


class TestETransfer(TestBase):

    # What is the action be requested of the user here?
    def test_navigate_to_transfer(self):
        samples_folder = get_private_folder("samples", "etransfer")
        page_links = json.load(open(samples_folder / "detect_navigate" / "links.json"))
        gold = json.load(open(samples_folder / "detect_navigate" / "links-gold.json"))

        best_link = best_etransfer_link(page_links)
        print(f"Best link found: {best_link}")
        self.assertEqual(best_link, gold["best_link"])

    def test_detect_etransfer_form(self):
        # TODO!!!
        pass
        

import json

from pydantic import BaseModel, Field
from shapely import Point
from TestBase import TestBase
from data_elements import ElementResponse
from geo_math import BBox, get_distance
from testdata import get_private_folder, load_image
from etransfer_routes import best_etransfer_link, detect_next_button, detect_to_recipient

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

class ButtonResponse(ElementResponse):
    content: str = Field(..., description="button text")
    enabled: bool
    
class NextStepExistsResponse(BaseModel):
    next_button_visible: bool
    reasoning: str = Field(..., description="explain your reasoning")

    
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

    async def test_etransfer_recipient(self):
        samples_folder = get_private_folder("samples", "etransfer")
        all_json = samples_folder.glob("**/*-gold.json")
        for json_file in all_json:
            gold = json.load(open(json_file))
            if ("SelectRecipient" in gold):
                # replace -gold.json with .png
                image_file_stem = json_file.name.replace("-gold.json", ".png")
                image_file = json_file.with_name(image_file_stem)
                image = load_image(str(image_file))
                gold_box = BBox.from_coords(gold["SelectRecipient"]["coords"])

                response = await detect_to_recipient(image, gold["SelectRecipient"]["address"])
                pointed = Point(response.position_x, response.position_y)
                is_contained = get_distance(pointed, gold_box) == 0
                
                self.assertEqual(is_contained, True)

    async def test_detect_next_button(self):
        samples_folder = get_private_folder("samples", "etransfer")
        all_json = samples_folder.glob("**/*-gold.json")
        for json_file in all_json:
            
            image_file_stem = json_file.name.replace("-gold.json", ".png")
            image_file = json_file.with_name(image_file_stem)
            if not image_file.exists():
                continue

            key = image_file.parent.name
            step = image_file.stem

            with self.subTest(key=key, step=step):
                gold = json.load(open(json_file))
                image = load_image(str(image_file))

                detected = await detect_next_button(image)

                gold_button_exists = "next_button" in gold
                self.assertEqual(detected is not None, gold_button_exists)
                if detected:
                    gold = gold["next_button"]
                    enabled = gold.get("enabled", True)
                    self.assertEqual(detected.enabled, enabled)
                    self.assertEqual(detected.content, gold["text"])
                    button_bbox = BBox.from_coords(gold["coords"])
                    pointed = Point(detected.position_x, detected.position_y)
                    is_contained = get_distance(pointed, button_bbox) == 0
                    self.assertTrue(is_contained)
            
        

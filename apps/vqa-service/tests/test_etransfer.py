import enum
import json

from pydantic import BaseModel, Field
from shapely import Point
from TestBase import TestBase
from case_insensitive_enum import CaseInsensitiveEnum
from data_elements import ElementResponse
from geo_math import BBox, get_distance
from intent_routes import page_error
from run_endpoint_query import run_endpoint_query
from testdata import get_private_folder, load_image
from etransfer_routes import best_etransfer_link, detect_etransfer_form, detect_etransfer_stage, detect_next_button, detect_to_recipient

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

# class ETransferStage(CaseInsensitiveEnum):
#     FILL_FORM = "FillForm"
#     REVIEW_DETAILS = "ReviewDetails"
#     TRANSFER_COMPLETE = "TransferComplete"
    
# typesStr = ", ".join([e.value for e in ETransferStage])

# class ETransferStageResponse(BaseModel):
#     stage: ETransferStage = Field(..., description="option")
#     # reasoning: str = Field(..., description="explain your reasoning")
    
class TestETransfer(TestBase):

    # What is the action be requested of the user here?
    async def test_navigate_to_transfer(self):
        samples_folder = get_private_folder("samples", "etransfer")
        links_files = samples_folder.glob("detect_navigate/*-links.json")
        for links_file in links_files:
            gold_file = links_file.with_name(links_file.name.replace("-links.json", "-links-gold.json"))
            gold = json.load(open(gold_file))

            page_links = json.load(open(links_file))
            best_link = await best_etransfer_link(page_links)
            print(f"Best link found: {best_link.best_link}")
            self.assertEqual(best_link.best_link, gold["best_link"])

    async def test_detect_etransfer_form(self):
        samples_folder = get_private_folder("samples", "etransfer")
        all_images = (samples_folder / "detect_form").glob("**/*.png")
        for image_file in all_images:
            json_file_stem = image_file.name.replace(".png", "-intent.json")
            json_file = image_file.with_name(json_file_stem)

            if (not json_file.exists()):
                continue

            image = load_image(str(image_file))
            intent = json.load(open(json_file))
            has_form = await detect_etransfer_form(image, intent['title'])
            print(f"Form Present: {has_form.form_present}")
            # intent = await detect_etransfer_form(image, intent['title'])
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

            # if (key != "Tangerine"):
            #     continue

            # if (step != "4-page" and step != "6-page"):
            #     continue

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


    async def test_etransfer_status(self):
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

                detected_stage = await detect_etransfer_stage(image, "Send Transfer") # NOTE: Need to fix this title

                self.assertEqual(detected_stage.stage, gold['stage'])

    async def test_etransfer_error(self):
        samples_folder = get_private_folder("samples")
        all_images = samples_folder.glob("**/*.png")
        for image_file in all_images:
            
            # skip dbg outputs
            if ("dbg_outputs" in str(image_file)):
                continue

            key = image_file.parent.name
            step = image_file.stem

            with self.subTest(key=key, step=step):
                image = load_image(str(image_file))
                detected_error = await page_error(image)
                print(f"Detected error with key {key}: {detected_error.error_message_detected}, message: {detected_error.error_message}")
                gold_error = "error" in key
                self.assertEqual(detected_error.error_message_detected, gold_error)

            
        

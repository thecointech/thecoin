from collections import defaultdict
from TestBase import TestBase
from etransfer_data import ButtonResponse
from intent_routes import page_error
from etransfer_routes import (
    best_etransfer_link,
    detect_etransfer_form,
    detect_etransfer_stage,
    input_types,
    detect_next_button,
    detect_to_recipient
)
from common_routes import detect_most_similar_option
from tests.testutils.dbg_only_failed import DebugFailingTests
from tests.testutils.testdata import TestData

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

    section = "SendETransfer"
    record_time = "archive"

    # What is the action be requested of the user here?
    async def test_navigate_to_transfer(self):

        async def test_navigate_to_transfer(test: TestData):
            original = test.vqa("bestEtransferLink")
            response = await best_etransfer_link(original.args[0])
            self.assertEqual(response.best_link, original.response["best_link"])
        await self.run_subTests_TestData("bestEtransferLink", test_navigate_to_transfer)

    # Test the case that failed way-back-when
    async def test_failed_links(self):
        best_link = await best_etransfer_link(["Transfers", "Make a Transfer", "Interac e-Transfer"])
        self.assertEqual(best_link.best_link, "Interac e-Transfer")

    async def test_detect_etransfer_form(self):
        await self.run_subTests_Vqa("detectEtransferForm", detect_etransfer_form)

        # Test negatives too (this should be moved within record)
        # Commented out for now: this test is nearly useless, as it
        # will always return true.  The best validation is probably
        # to just check for the presence of the required inputs

        # samples_folder = get_private_folder("samples", "etransfer")
        # all_images = (samples_folder / "detect_form").glob("**/*.png")
        # for image_file in all_images:
        #     key = "samples-" + image_file.parent.name + "-" + image_file.stem
        #     with self.subTest(key=key):
        #         json_file_stem = image_file.name.replace(".png", "-intent.json")
        #         json_file = image_file.with_name(json_file_stem)

        #         if (not json_file.exists()):
        #             continue

        #         image = load_image(str(image_file))
        #         intent = json.load(open(json_file))
        #         has_form = await detect_etransfer_form(image, intent['title'])
        #         self.assertEqual(has_form.form_present, False)

    async def test_detect_input_types(self):
        async def test_input_types(test: TestData):
            original = test.vqa("inputTypes")
            response = await input_types(test.image, *original.args)
            self.assertListEqual(response, original.response) # type: ignore - this response (only) is not a dict
        await self.run_subTests_TestData("inputTypes", test_input_types)

    async def test_etransfer_recipient(self):
        await self.run_subTests_Elements("select-recipient", vqa="detectToRecipient", endpoint=detect_to_recipient)


    async def test_detect_next_button(self):

        async def test_detect_next_button(datum: list[TestData]):
            response, vqa, elm = None, None, None
            # sort datum by key
            datum.sort(key=lambda x: x.key)
            for data in datum:
                # First, make sure there is an original query
                # The list should be detect/step/detect/step...
                if not vqa and data.has_vqa("detectNextButton"):
                    vqa = data.vqa("detectNextButton")
                    elm = None
                # if we have a response, validate it against step
                if vqa and not elm and data.has_element("step"):
                    # Our images are somehow being written out outta-whack
                    response = await detect_next_button(data.image)
                    assert response is not None
                    vqa_response = vqa.response
                    self.assertResponse(response, data, "step", vqa = lambda: ButtonResponse(**vqa_response))
                    vqa = None
            assert vqa is None

        datas = self.get_test_data("{step,detectNextButton}")

        # next buttons & detections often mix up their step number
        # so group them by folder & process all at once.
        data_by_folder: defaultdict[str, list[TestData]] = defaultdict(list)
        for data in datas:
            # add all vqa to the list
            data_by_folder[data._matched_folder].append(data)

        tests = [(folder, lambda: test_detect_next_button(data_by_folder[folder])) for folder in data_by_folder]
        await self.run_subTests(tests, "eTransfer_detectNextButton")


    async def test_etransfer_status(self):
        await self.run_subTests_Vqa("detectEtransferStage", detect_etransfer_stage)


    async def test_etransfer_error(self):
        await self.run_subTests_Vqa("pageError", page_error)


    async def test_similarity(self):
        similarity = await detect_most_similar_option("Chequing Account: 1234567", ["Select an account", "Your Basic Chequing Account 123**** - $89.90"])
        self.assertEqual(similarity.most_similar, "Your Basic Chequing Account 123**** - $89.90")




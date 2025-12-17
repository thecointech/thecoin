import json

from PIL import Image
from pydantic import BaseModel
from TestBase import TestBase
from data_elements import ElementResponse
from geo_math import BBox
from input_detection import deduplicate_unique, detect_input_types, get_form_bbox, overlay_image, calculate_element_groups, calculate_group_bbox, query_input_group_type
from run_endpoint_query import run_endpoint_query
from testdata import SampleData, get_private_folder, get_sample_data
from etransfer_data import InputType


class TestInputsProcess(TestBase):

    def test_generating_form_bbox(self):
        etransfers = get_sample_data("etransfer")
        for key, pages in etransfers.items():
            for page in pages:
                with self.subTest(key=key, step=page.key):
                    form_bbox = get_form_bbox(page.image)
                    overlay = overlay_image(page.image, [form_bbox])
                    write_image(page, 'form', overlay)
                    write_model(page, 'form', form_bbox)


    def test_grouping(self):
        etransfers = get_sample_data("etransfer")
        for key, pages in etransfers.items():
            for page in pages:
                grouping = calculate_element_groups(page.elements)
                form_bbox = read_model(page, 'form', BBox)
                for (idx, group) in enumerate(grouping):
                    group_box = calculate_group_bbox(form_bbox, [page.parent_coords[el_idx] for el_idx in group])
                    highlighted_image = overlay_image(page.image, [group_box])
                    write_image(page, f'{idx}-group', highlighted_image)
                    write_json(page, f'{idx}-group', group)
                    write_model(page, f'{idx}-group-box', group_box)


    async def test_single_group(self):
        etransfers = get_sample_data("etransfer")
        samples_folder = get_private_folder("samples", "etransfer")
        failing_tests = []

        test_filter = None
        # To only re-run failing tests, uncomment the following
        # test_filter = json.load(open(samples_folder / "failures.json"))
        
        for key, pages in etransfers.items():
            for page in pages:
                grouping = calculate_element_groups(page.elements)
                form_bbox = read_model(page, 'form', BBox)
                for (idx, group) in enumerate(grouping):

                    if test_filter and [key, page.key, idx] not in test_filter:
                        continue

                    # Skip the OOR input (search box)
                    verified_types = (page.raw or page.gold)
                    if group[0] >= len(verified_types):
                        continue

                    idx_verified_types = [verified_types[el_idx] for el_idx in group]

                    with self.subTest(key=key, page=page.key, idx=idx):
                        group_box = calculate_group_bbox(form_bbox, [page.parent_coords[el_idx] for el_idx in group])
                        highlighted_image = overlay_image(page.image, [group_box])
                        elements = [page.elements[el_idx] for el_idx in group]
                        group_type = await query_input_group_type(highlighted_image, elements)

                        # For easy debugging, let's see what we have
                        if group_type != idx_verified_types[0]:
                            highlighted_image.show()
                            print(f"Got {group_type}, expected {idx_verified_types[0]}")
                            failing_tests.append((key, page.key, idx))

                        for verified_type in idx_verified_types:
                            self.assertEqual(group_type, verified_type)

        with open(samples_folder / "failures.json", "w") as f:
            f.write(json.dumps(failing_tests, indent=2))


    async def test_detect_inputs(self):
        etransfers = get_sample_data("etransfer")
        for key, pages in etransfers.items():
            for page in pages:

                with self.subTest(key=key, step=page.key):

                    detected_types = await detect_input_types(
                        page.image, page.elements, page.parent_coords
                    )

                    verified_types = page.raw or page.gold
                    for detected_type, verified_type in zip(detected_types, verified_types):
                        self.assertEqual(detected_type, verified_type)

    async def test_deduplicate_entries(self):
        etransfers = get_sample_data("etransfer")
        for key, pages in etransfers.items():
            for page in pages:
                # A page only has "raw" if there were duplicates
                if not page.raw:
                    continue

                with self.subTest(key=key, step=page.key):
                    raw_types = [InputType(type) for type in page.raw]

                    fixed_types = await deduplicate_unique(
                        raw_types, page.image, page.elements, page.parent_coords
                    )
                    for detected_type, verified_type in zip(fixed_types, page.gold):
                        self.assertEqual(detected_type, verified_type)  

    async def test_confirmation_code(self):
        etransfers = get_sample_data("etransfer")
        for key, pages in etransfers.items():
            for page in pages:
                # A page only has "raw" if there were duplicates
                if "ConfirmationCode" not in page.gold:
                    continue

                with self.subTest(key=key, step=page.key):

                    confirmation_code = await run_endpoint_query(
                        page.image,
                        (
                            "Describe the code that identifies the successful e-transfer.",
                            ElementResponse
                        )
                    )

                    self.assertEqual(confirmation_code.content, page.gold["ConfirmationCode"])


def dbg_output(page: SampleData, name: str):
    return page.path / "dbg_outputs" / f"{page.key}-{name}"

def write_json(page: SampleData, name: str, data: dict):
    with open(dbg_output(page, name + ".json"), "w") as f:
        f.write(json.dumps(data, indent=2))

def write_model(page: SampleData, name: str, data: BaseModel):
    with open(dbg_output(page, name + ".json"), "w") as f:
        f.write(data.model_dump_json(indent=2))

def write_image(page: SampleData, name: str, image: Image.Image):
    image.save(dbg_output(page, name + ".png"))

def read_model(page: SampleData, name: str, model: BaseModel):
    with open(dbg_output(page, name + ".json"), "r") as f:
        return model.model_validate(json.load(f))

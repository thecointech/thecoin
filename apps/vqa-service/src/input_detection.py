import json
import re
from PIL import Image
from geo_math import BBox, get_distance, point_out_of_bbox
from helpers_image import overlay_image
from pointing import get_points
from query import runQueryRaw
from etransfer_data import InputType, InputTypeResponse, unique_input_types
from run_endpoint_query import run_endpoint_query


async def detect_input_types(page: Image.Image,elements: list[object], parent_coords: list[BBox]) -> list[InputType]:
    # Initialize our return values to None (should all be set by end of function)
    return_types = [None] * len(elements)

    # Group the inputs by row/radio type.  This is mostly to ensure
    # that we get consistent types for elements in the same group
    form_bbox = get_form_bbox(page)
    grouping = calculate_element_groups(elements)

    for group in grouping:

        group_parent_coords = [parent_coords[el_idx] for el_idx in group]
        group_elements = [elements[el_idx] for el_idx in group]

        # group_parent_coords = [parent_coords[el_idx] for el_idx in group]
        group_box = calculate_group_bbox(form_bbox, group_parent_coords)

        # !!!TO VERIFY!!!
        # The form detection seems robust, but needs verification
        # However, for now we are dropping inputs that aren't in the form
        # if not form_bbox.intersects(group_box):
        #     continue

        highlighted_image = overlay_image(page, [group_box])
        group_type = await query_input_group_type(highlighted_image, group_elements)

        for el_idx in group:
            return_types[el_idx] = group_type

    return return_types


def get_form_bbox(page: Image.Image):
    # First, find the extents of the form.
    response = runQueryRaw(page, "Point to the four corners of the \"Send etransfer\" form on this webpage", 1000)
    form_points = get_points(page, response)
    return BBox.from_points(form_points)


def calculate_group_bbox(form_bbox: BBox, parent_coords: list[BBox]) -> BBox:
    # Find the box encapsulating all group elements
    group_box = BBox.merge_all(parent_coords)
    # Extend to fill the form box, and add some padding
    return group_box.extend(left=form_bbox.left, right=form_bbox.right).add(10)


async def deduplicate_unique(
    return_types: list[InputType],
    page: Image,
    elements: list[object],
    parent_coords: list[BBox],
):
    # double-check duplicates
    fixed_types = return_types.copy()

    for unique_type in unique_input_types:
        unique_type_idxs = [
            idx
            for idx, t in enumerate(fixed_types)
            if t == unique_type and elements[idx].get("inputType") != "radio"
        ]
        num_unique = len(unique_type_idxs)
        if num_unique > 1:
            print(f"Duplicate {unique_type} found at {unique_type_idxs} - verifying...")

            # get boxes of the duplicates
            dup_boxes = [parent_coords[idx] for idx in unique_type_idxs]
            # if some of the boxes are overlapping, merge them
            dup_boxes = BBox.merge_overlapping(dup_boxes)

            # Crop the image down to focus on just the elements detected as duplicates
            dup_crop = BBox.merge_all(dup_boxes).add(200)
            dup_image = page.crop(dup_crop)

            # Move boxes into the cropped image
            dup_boxes = [b.relative_to(dup_crop) for b in dup_boxes]

            dup_highlighted_image = overlay_image(dup_image, dup_boxes)
            query = f"Point to the input shaded in red of type {unique_type}."
            response = runQueryRaw(dup_highlighted_image, query, 1000)
            best_points = get_points(dup_highlighted_image, response)

            # which of elements is this?  We use element coords
            # because it's possible for parent coords to overlap
            dup_element_coords = [
                BBox.from_coords(elements[i]["coords"]) for i in unique_type_idxs
            ]
            # We should only have one response in best_points
            best_point = best_points[0]
            # Translate point back into original coord system
            best_point = point_out_of_bbox(best_point, dup_crop)
            dup_distances = [get_distance(best_point, coord) for coord in dup_element_coords]

            # get the index of the minimum distance
            min_idx = dup_distances.index(min(dup_distances))

            # Keep only the closest match, re-run the query for the others
            correct_idx = unique_type_idxs[min_idx]
            for idx in unique_type_idxs:
                if idx != correct_idx:
                    # We use the parent coords here to scope the attention down to just this element
                    highlight_coords = parent_coords[idx]
                    highlighted_image = overlay_image(page, [highlight_coords])
                    query = get_query([elements[idx]], unique_type)
                    response = await run_endpoint_query(
                        highlighted_image, (query, InputTypeResponse)
                    )
                    fixed_types[idx] = response.info

    return fixed_types


async def query_input_group_type(highlighted_image: Image.Image, group_elements: list[object]):
    query = get_query(group_elements)
    try:
        response = await run_endpoint_query(highlighted_image, (query, InputTypeResponse))
        return response.info
    except Exception as e:
        print(f"Error in group {group_elements}: {e}")
        return None


def calculate_element_groups(elements: list[object]):
    groups: list[list[int]] = []  # 2d array of indices of elements in a group

    # First pass - group all radio buttons
    radio_boxes: dict[str, int] = {}  # name -> group(index)
    for idx, element in enumerate(elements):
        if element.get("inputType") == "radio":
            name = element.get("name")
            if name is not None:
                if name in radio_boxes:
                    # Merge by taking the union of the bounding boxes
                    group_idx = radio_boxes[name]
                    groups[group_idx].append(idx)
                else:
                    group_idx = len(groups)
                    groups.append([idx])
                    radio_boxes[name] = group_idx

    # Second pass - group elements by their center-y coordinate
    y_groups: dict[float, int] = {}  # center_y -> group(index)
    y_threshold = 5  # pixels threshold for grouping by y coordinate
    for idx, element in enumerate(elements):
        # Skip elements (radio groups) we already have a box for
        if element.get("inputType") == "radio":
            name = element.get("name")
            if name is not None:
                continue

        center_y = element["coords"]["centerY"]

        # Find the closest y_group within threshold
        matched = False
        for group_y, group_idx in y_groups.items():
            if abs(center_y - group_y) <= y_threshold:
                groups[group_idx].append(idx)
                matched = True
                break

        if not matched:
            y_groups[center_y] = len(groups)
            groups.append([idx])

    return groups


def get_query(elements: list, filter_out_type: InputType = None):
    best_types = [get_element_type(el) for el in elements]
    best_type = best_types[0] if len(set(best_types)) == 1 else "inputs"

    all_props = [get_element_props(el) for el in elements]
    query_props = merge_element_props(all_props)

    base_q = f"the {best_type} in the red shaded region has the following properties: {json.dumps(query_props)}"

    it_them = "it" if len(elements) == 1 else "them"

    query_part = "What kind of information can be entered into {}?".format(it_them)

    if "radio" in best_type or "select" in best_type:
        query_part = "What kind of information can be chosen by {}?".format(it_them)

    typesStr = ", ".join([e.value for e in InputType if e != filter_out_type])
    types_part = "Select from the following InputTypes: {}.".format(typesStr)
    unknown_part = 'If there is no good match, return {"info":"Unknown"}.'
    return " ".join([base_q, query_part, types_part, unknown_part])


def get_element_props(element: dict):
    el_name = get_prop(element, "name", None)
    el_label = get_prop(element, "label", None)
    el_options = get_prop(element, "options", None)
    query_props = {}
    if el_label:
        query_props["label"] = el_label.strip()
    if el_name:
        query_props["name"] = el_name.strip()
    if el_options:
        num_chars = 0
        options = []
        for o in el_options:
            clean = re.sub(r"\s+", " ", o).strip()
            num_chars += len(clean)
            if num_chars == 0:
                continue
            # We don't want to overwhelm the prompt with these options
            if len(options) >= 5 or num_chars >= 125:
                options.append("...")
                break
            options.append(clean)

        query_props["options"] = options

    return query_props


def merge_element_props(all_props):
    if len(all_props) == 1:
        return all_props[0]
    else:
        merged_props = {}
        all_labels = [qp["label"] for qp in all_props if "label" in qp]
        all_names = [qp["name"] for qp in all_props if "name" in qp]
        all_options = [qp["options"] for qp in all_props if "options" in qp]

        if len(all_labels) > 0:
            merged_props["labels"] = ", ".join(set(all_labels))
        if len(all_names) > 0:
            merged_props["names"] = ", ".join(set(all_names))
        if len(all_options) > 0:
            merged_props["options"] = all_options
        return merged_props


def get_element_type(element: dict):
    el_tagName = get_prop(element, "tagName" , "input")
    el_inputType = get_prop(element, "inputType", None)
    best_type = el_inputType if (el_inputType is not None and el_inputType != "text" and el_inputType != "password") else el_tagName
    return best_type.lower()


# Helper to get property from either dict or object
def get_prop(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)
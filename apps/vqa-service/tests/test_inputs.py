import json
import re
from TestBase import TestBase
from image_query_data import get_points
from query import runQueryRaw
from testdata import load_image, load_json
from run_endpoint_query import MAX_RESOLUTION, Box, run_endpoint_query
from PIL import ImageDraw, Image
import os
from etransfer_data import InputType, InputTypeResponse, query_input_type, typesStr


test_folder = os.environ.get("PRIVATE_TESTING_PAGES", "~/")
test_target = os.environ.get("PRIVATE_TESTING_TARGET", "target")
samples_folder = os.path.join(test_folder, "unit-tests", "samples", test_target)


class TestInputsProcess(TestBase):

  def test_generating_input_highlights(self):

    for i in range(1, 6):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)

      # Merge coordinates for radio elements
      parentCoords = test_data['parentCoords']
      elements = test_data['elements']
      (_mapping, boxes) = calculate_element_boxes(elements, parentCoords)

      # Generate the image with inputs/groups highlighted
      out = overlay_image(test_image, boxes)
      out.save(samples_folder + f"/{i}-page-highlights.png")
      out.show()


  async def test_highlighted_single_input(self):
    for i in range(1, 6):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
      validation_data = load_json(samples_folder + f"/{i}-inputs.json")

      for (coordIdx, box) in enumerate(test_data['parentCoords']):
        highlighted_image = overlay_image(test_image, [standardize_coords(box)])

        response = await run_endpoint_query(highlighted_image, query_input_type)

        highlighted_image.save(samples_folder + f"/{i}-single-{coordIdx}-highlight.png")
        highlighted_image.show()
        print (f"Got {response.type}, expected {validation_data['inputs'][coordIdx]}")

      print("Done")

  async def test_highlighted_inputs(self):
    for i in range(1, 6):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
      validation_data = load_json(samples_folder + f"/{i}-inputs.json")

      # Merge coordinates for radio elements
      parentCoords = test_data['parentCoords']
      elements = test_data['elements']
      (_mapping, boxes) = calculate_element_boxes(elements, parentCoords)

      for (group_idx, box) in enumerate(boxes):
        highlighted_image = overlay_image(test_image, [box])

        response = await run_endpoint_query(highlighted_image, query_input_type)

        highlighted_image.save(samples_folder + f"/{i}-group-{group_idx}-highlight.png")
        highlighted_image.show()
        print (f"Got {response.type}, expected {validation_data['inputs'][i]}")

      print("Done")


  async def test_arrowed_inputs(self):
    for i in range(1, 6):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
      validation_data = load_json(samples_folder + f"/{i}-inputs.json")

      for (coordIdx, element) in enumerate(test_data['elements']):
        coords = element['coords']
        highlighted_image = overlay_arrow(test_image, [standardize_coords(coords)])

        highlighted_image.save(samples_folder + f"/{i}-single-{coordIdx}-arrow.png")
        highlighted_image.show()

        response = await run_endpoint_query(highlighted_image,  (
          f"From the following options, select the one that best describes the input indicated by the red arrow: {typesStr}.",
          InputTypeResponse
        ))
        print (f"Got {response.type}, expected {validation_data['inputs'][coordIdx]}")

      print("Done")
  # This is not feasible, with many points the results are completely whacked.
  # async def test_point_to_inputs(self):
  #   for i in range(1, 6):
  #     test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
  #     test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
  #     validation_data = load_json(samples_folder + f"/{i}-inputs.json")

  #     response = runQueryRaw(test_image, "Point to the inputs on this webpage", 1000)
  #     coords = get_points(response)

  #     annotated = draw_points(test_image, coords)
  #     annotated.show()

  #     print("Done")

  async def test_isolate_form(self):
    for i in range(4, 6):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
      validation_data = load_json(samples_folder + f"/{i}-inputs.json")

      elements = test_data['elements']
      parentCoords = test_data['parentCoords']
      validations = validation_data['inputs']

      return_types = [None] * len(elements)

      grouping = calculate_element_groups(elements, parentCoords)
      boxes = calculate_group_boxes(grouping, parentCoords)

      # First, trim the image down to just the form
      response = runQueryRaw(test_image, "Point to the four corners of the \"Send etransfer\" form on this webpage", 1000)
      form_points = get_points(test_image, response)

      top = min(map(lambda c: c[1], form_points))
      left = min(map(lambda c: c[0], form_points))
      right = max(map(lambda c: c[0], form_points))
      bottom = max(map(lambda c: c[1], form_points))

      # verify crop
      cropped_image = test_image.crop((left, top, right, bottom))
      cropped_image.show()
      cropped_image.save(samples_folder + f"/{i}-cropped.png")

      crop = Box(left=left, top=top, right=right, bottom=bottom)

      for group_idx, group in enumerate(grouping):

        group_elements = [elements[el_idx] for el_idx in group]
        box = boxes[group_idx]

        # Extend over the entire section
        box['left'] = min(crop.left, box['left'])
        box['right'] = max(crop.right, box['right'])
        highlighted_image = overlay_image(test_image, [box])
        highlighted_image.save(samples_folder + f"/{i}-group-{group_idx}-highlight.png")
        highlighted_image.show()

        # cropped = highlighted_image.crop((crop.left, crop.top, crop.right, crop.bottom))
        # cropped.show()
        # cropped.save(samples_folder + f"/{i}-group-{group_idx}-highlight-cropped.png")

        group_elements = [elements[el_idx] for el_idx in group]
        query = get_query(group_elements)
        response = await run_endpoint_query(highlighted_image, (query, InputTypeResponse))

        # cropped.save(samples_folder + f"/{i}-single-{coordIdx}-highlight.png")
        # cropped.show()
        for el_idx in group:
          return_types[el_idx] = response.info

        group_validations = [validations[idx] for idx in group]
        print (f"Got {response.info}, expected {group_validations}")

      # Fix duplicates
      fixed_types = await deduplicate_unique(return_types, test_image, elements, parentCoords, i)
      matching = list(zip(fixed_types, validations))
      print (matching)


  async def test_deduplicate_entries(self):
    for i in range(4, 5):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
      validation_data = load_json(samples_folder + f"/{i}-inputs.json")

      elements = test_data['elements']
      parentCoords = test_data['parentCoords']
      validations = validation_data['inputs']

      return_types = [
        InputType.AMOUNT_TO_SEND, InputType.AMOUNT_TO_SEND, InputType.FROM_ACCOUNT, InputType.SECRET_ANSWER, InputType.SECRET_ANSWER
      ]

      fixed_types = await deduplicate_unique(return_types, test_image, elements, parentCoords, i)
      matching = list(zip(fixed_types, validations))
      print (matching)
  

async def deduplicate_unique(return_types: list[InputType], test_image: Image, elements: list[object], parentCoords: list[Box], page_idx: int):
  # double-check duplicates
  cannot_duplicate = [
    InputType.AMOUNT_TO_SEND,
    InputType.TO_RECIPIENT,
    InputType.FROM_ACCOUNT,
    InputType.SECRET_QUESTION,
    InputType.SECRET_ANSWER,
  ]

  fixed_types = return_types.copy()

  for unique_type in cannot_duplicate:
    unique_type_idxs = [idx for idx, t in enumerate(fixed_types) if t == unique_type and elements[idx].get('inputType') != 'radio']
    num_unique = len(unique_type_idxs)
    if num_unique > 1:
      print (f"Duplicate {unique_type} found at {unique_type_idxs} - verifying...")

      # get boxes of the duplicates
      dup_boxes = [standardize_coords(parentCoords[idx]) for idx in unique_type_idxs]
      # if some of the boxes are overlapping, merge them
      dup_boxes = merge_boxes(dup_boxes)

      # find extents of this area of the form
      top = min([get_prop(b, "top") for b in dup_boxes])
      left = min([get_prop(b, "left") for b in dup_boxes])
      right = max([get_prop(b, "right") for b in dup_boxes])
      bottom = max([get_prop(b, "bottom") for b in dup_boxes])
      padding = 200
      crop = Box(left=(left - padding), top=(top - padding), right=(right + padding), bottom=(bottom + padding))
      dup_image = test_image.crop((crop.left, crop.top, crop.right, crop.bottom))

      # Apply crop to boxes
      dup_boxes = [Box(left=b.left - crop.left, top=b.top - crop.top, right=b.right - crop.left, bottom=b.bottom - crop.top) for b in dup_boxes]

      #####################
      #
      # CONTINUE HERE: APPLY CROP TO DUP_BOXES
      #                TEST QUERY WITH "SHADED RED" INSTRUCTION
      #                AND REFACTOR
      #
      #####################
      dup_highlighted_image = overlay_image(dup_image, dup_boxes)
      dup_highlighted_image.save(samples_folder + f"/{page_idx}-unique-{unique_type}-highlight.png")
      dup_highlighted_image.show()

      query = f"Point to the input shaded in red of type {unique_type}."
      response = runQueryRaw(dup_highlighted_image, query, 1000)
      best_points = get_points(dup_highlighted_image, response)

      dup_annotated = draw_points(dup_highlighted_image, best_points)
      dup_annotated.show()
      dup_annotated.save(samples_folder + f"/{page_idx}-unique-{unique_type}-pointed-at.png")

      # which of elements is this?  We use element coords 
      # because it's possible for parent coords to overlap
      dup_element_coords = [standardize_coords(elements[i]["coords"]) for i in unique_type_idxs]
      # We should only have one response in best_points
      best_point = best_points[0]
      # Translate point back into original coord system
      best_point = (best_point[0] + crop.left, best_point[1] + crop.top)
      dup_distances = get_distance_from_point(dup_element_coords, best_point)

      # get the index of the minimum distance
      min_idx = dup_distances.index(min(dup_distances))

      # Keep only the closest match, re-run the query for the others
      correct_idx = unique_type_idxs[min_idx]
      for idx in unique_type_idxs:
        if idx != correct_idx:
          # We use the parent coords here to scope the attention down to just this element
          parent_coords = standardize_coords(parentCoords[idx])
          highlighted_image = overlay_image(test_image, [parent_coords])
          highlighted_image.save(samples_folder + f"/{page_idx}-unique-{unique_type}-{idx}-highlight.png")
          query = get_query(elements[idx], unique_type)
          response = await run_endpoint_query(highlighted_image, (query, InputTypeResponse))
          fixed_types[idx] = response.info

  return fixed_types
  
def get_element_props(element: dict):
  el_name = get_prop(element, "name", None)
  el_label = get_prop(element, "label", None)
  el_options = get_prop(element, "options", None)
  query_props = {}
  if (el_label):
    query_props["label"] = el_label.strip()
  if (el_name):
    query_props["name"] = el_name.strip()
  if el_options:
    num_chars = 0
    options = []
    for o in el_options:
      clean = re.sub(r'\s+',' ',o).strip()
      num_chars += len(clean)
      if (num_chars == 0):
        continue
      # We don't want to overwhelm the prompt with these options
      if len(options) >= 5 or num_chars >= 125:
        options.append("...")
        break
      options.append(clean)

    query_props["options"] = options

  return query_props

def merge_element_props(all_props):
  if (len(all_props) == 1):
    return all_props[0]
  else:
    merged_props = {}
    all_labels = [qp["label"] for qp in all_props if "label" in qp]
    all_names = [qp["name"] for qp in all_props if "name" in qp]
    all_options = [qp["options"] for qp in all_props if "options" in qp]

    if (len(all_labels) > 0):
      merged_props["labels"] = ", ".join(set(all_labels))
    if (len(all_names) > 0):
      merged_props["names"] = ", ".join(set(all_names))
    if (len(all_options) > 0):
      merged_props["options"] = all_options
    return merged_props

def get_element_type(element: dict):
  el_tagName = get_prop(element, "tagName" , "input")
  el_inputType = get_prop(element, "inputType", None)
  best_type = el_inputType if (el_inputType is not None and el_inputType != "text" and el_inputType != "password") else el_tagName
  return best_type.lower()

def get_query(elements: list, filter_out_type: InputType = None):
  best_types = [get_element_type(el) for el in elements]
  best_type = best_types[0] if len(set(best_types)) == 1 else "inputs"

  all_props = [get_element_props(el) for el in elements]
  query_props = merge_element_props(all_props)
      
  base_q = f"the {best_type} in the red shaded region has the following properties: {json.dumps(query_props)}"

  it_them = "it" if len(elements) == 1 else "them"

  query_part = "What kind of information can be entered into {}?".format(it_them)

  if ("radio" in best_type or "select" in best_type):
    query_part = "What kind of information can be chosen by {}?".format(it_them)

  typesStr = ", ".join([e.value for e in InputType if e != filter_out_type])
  types_part = "Select from the following types: {}.".format(typesStr)
  unknown_part = "If there is no good match, return {\"info\":\"Unknown\"}."
  return " ".join([base_q, query_part, types_part, unknown_part])


# def get_query(element: object):
#   el_tagName = get_prop(element, "tagName" , "input")
#   el_inputType = get_prop(element, "inputType", None)
#   el_name = get_prop(element, "name", None)
#   el_label = get_prop(element, "label", None)
#   el_options = get_prop(element, "options", None)

#   best_type = el_inputType if (el_inputType is not None and el_inputType != "text") else el_tagName
        
#   base_q = f"What information should be entered in the {best_type} "

#   name_part = ""
#   if el_label:
#     name_part = f" with the label \"{el_label.lower().strip()}\""
#   elif el_name:
#     name_part = f" with the name \"{el_name.lower().strip()}\""

#   options_part = ""
#   if el_options:
#     num_chars = 0
#     options = []
#     for o in el_options:
#       clean = re.sub(r'\s+',' ',o).strip()
#       num_chars += len(clean)
#       if (num_chars == 0):
#         continue
#       # We don't want to overwhelm the prompt with these options
#       if len(options) >= 5 or num_chars >= 125:
#         options.append("...")
#         break
#       options.append(clean)

#     options_part = "with these options ({}) ".format(", ".join(options))
#     if (name_part != ""):
#       options_part += "and "

#   q = base_q + options_part + name_part + f" in the red shaded region? Select from the following types: {typesStr}."
#   return q + " If there is no good match, return \"Unknown\"."

# def get_query(element: object):
#   el_tagName = get_prop(element, "tagName" , "input")
#   el_inputType = get_prop(element, "inputType", None)
#   el_name = get_prop(element, "name", None)
#   el_label = get_prop(element, "label", None)
#   el_options = get_prop(element, "options", None)

#   best_type = el_inputType if (el_inputType is not None and el_inputType != "text") else el_tagName
        
#   base_q = f"Analyze the {best_type} "

#   name_part = ""
#   if el_label:
#     name_part = f"with the label \"{el_label.lower().strip()}\" "
#   elif el_name:
#     name_part = f"with the name \"{el_name.lower().strip()}\" "

#   options_part = ""
#   if el_options:
#     num_chars = 0
#     options = []
#     for o in el_options:
#       clean = re.sub(r'\s+',' ',o).strip()
#       num_chars += len(clean)
#       if (num_chars == 0):
#         continue
#       # We don't want to overwhelm the prompt with these options
#       if len(options) >= 5 or num_chars >= 125:
#         options.append("...")
#         break
#       options.append(clean)

#     options_part = "with these options ({}) ".format(", ".join(options))
#     if (name_part != ""):
#       name_part += "and "

#   intro_part = base_q + name_part + options_part + "in the red shaded region."
#   query_part = "What type of information can be entered into it?"
#   types_part = " Select from the following types: {}.".format(typesStr)
#   unknown_part = "If there is no good match, return \"Unknown\"."
#   return " ".join([intro_part, query_part, types_part, unknown_part])


# Helper to convert coords to standard format with right/bottom
def standardize_coords(coords):
  return {
    'top': coords['top'],
    'left': coords['left'],
    'right': coords['left'] + coords['width'],
    'bottom': coords['top'] + coords['height']
  }

# Helper to get property from either dict or object
def get_prop(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

# Helper to check if one box is contained within another
def is_contained_within(inner, outer):
  return (get_prop(inner, 'left', 0) >= get_prop(outer, 'left', 0) and 
          get_prop(inner, 'right', float('inf')) <= get_prop(outer, 'right', float('inf')) and
          get_prop(inner, 'top', 0) >= get_prop(outer, 'top', 0) and 
          get_prop(inner, 'bottom', float('inf')) <= get_prop(outer, 'bottom', float('inf')))


def calculate_element_boxes(elements, parentCoords):
  # First calculate bounding boxes for radio elements
  boxes = [] # Bounding boxes
  # map elements to boxes
  mapping = [None] * len(elements)
  # map radio groups to boxes
  radio_boxes = {}  # name -> box(index)
  
  # First pass - calculate radio button bounding boxes
  for idx, element in enumerate(elements):
    if element.get('inputType') == 'radio':
      name = element.get('name')
      if name is not None:
        coords = standardize_coords(parentCoords[idx])
        if name in radio_boxes:
          # Merge by taking the union of the bounding boxes
          boxIndex = radio_boxes[name]
          existing = boxes[boxIndex]
          boxes[boxIndex] = {
            'top': min(existing['top'], coords['top']),
            'left': min(existing['left'], coords['left']),
            'bottom': max(existing['bottom'], coords['bottom']),
            'right': max(existing['right'], coords['right'])
          }
          mapping[idx] = boxIndex
        else:
          boxIndex = len(boxes)
          boxes.append(coords)
          mapping[idx] = boxIndex
          radio_boxes[name] = boxIndex
  
  # Second pass - map elements to their bounding boxes
  for idx, element in enumerate(elements):

    # Skip elements (radio groups) we already have a box for
    if mapping[idx] is not None:
      continue
    coords = standardize_coords(parentCoords[idx])
        
    # Check if this element is contained within any radio box
    contained_in_radio = False
    for radio_box_idx in radio_boxes.values():
      if is_contained_within(coords, boxes[radio_box_idx]):
        mapping[idx] = radio_box_idx
        contained_in_radio = True
        break
    
    # If not contained in any radio box, use original coords
    if not contained_in_radio:
      mapping[idx] = len(boxes)
      boxes.append(coords)
      
  return mapping, boxes

def calculate_element_groups(elements, parentCoords):
  groups = [] # 2d array of indices of elements in a group

  # First pass - group all radio buttons
  radio_boxes = {}  # name -> group(index)
  for idx, element in enumerate(elements):
    if element.get('inputType') == 'radio':
      name = element.get('name')
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
  y_groups = {}  # center_y -> group(index)
  y_threshold = 5  # pixels threshold for grouping by y coordinate
  for idx, element in enumerate(elements):
    # Skip elements (radio groups) we already have a box for
    if element.get('inputType') == 'radio':
      name = element.get('name')
      if name is not None:
        continue

    center_y = element['coords']['centerY']
    
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


def calculate_group_boxes(groups, parentCoords):
  boxes = []
  for group in groups:
    box = standardize_coords(parentCoords[group[0]])
    for element_idx in group[1:]:
      coords = standardize_coords(parentCoords[element_idx])
      box = {
        'top': min(get_prop(box, 'top'), get_prop(coords, 'top')),
        'left': min(get_prop(box, 'left'), get_prop(coords, 'left')),
        'bottom': max(get_prop(box, 'bottom'), get_prop(coords, 'bottom')),
        'right': max(get_prop(box, 'right'), get_prop(coords, 'right'))
      }
    boxes.append(box)
  return boxes

def merge_boxes(boxes):
    if not boxes:
        return []
    
    # Convert to list of lists for easier manipulation
    boxes = [[get_prop(box, "left"), get_prop(box, "top"), get_prop(box, "right"), get_prop(box, "bottom")] for box in boxes]
    
    def boxes_overlap(box1, box2):
        # Returns true if boxes overlap
        return not (box1[2] < box2[0] or  # box1.right < box2.left
                   box1[0] > box2[2] or  # box1.left > box2.right
                   box1[3] < box2[1] or  # box1.bottom < box2.top
                   box1[1] > box2[3])    # box1.top > box2.bottom
    
    def merge_two_boxes(box1, box2):
        # Returns a new box that encompasses both input boxes
        return [
            min(box1[0], box2[0]),  # left
            min(box1[1], box2[1]),  # top
            max(box1[2], box2[2]),  # right
            max(box1[3], box2[3])   # bottom
        ]
    
    merged = []
    while boxes:
        current = boxes.pop(0)
        merged_something = False
        
        # Try to merge with any existing merged boxes
        for i, existing in enumerate(merged):
            if boxes_overlap(current, existing):
                merged[i] = merge_two_boxes(current, existing)
                merged_something = True
                break
        
        if not merged_something:
            merged.append(current)
    
    # Convert back to Box objects
    return [Box(left=box[0], top=box[1], right=box[2], bottom=box[3]) for box in merged]

def overlay_image(image, boxes):
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    # Create a drawing object
    overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')

    # Draw semi-transparent red rectangles for each coordinate
    border_width = 5
    border_padding = border_width + 5
    for box in boxes:
        left = get_prop(box, 'left') - border_padding
        top = get_prop(box, 'top') - border_padding
        right = get_prop(box, 'right') + border_padding
        bottom = get_prop(box, 'bottom') + border_padding
        # Draw rectangle with 50% opaque red (255, 0, 0, 128)
        draw.rectangle([(left, top), (right, bottom)], fill=(255, 0, 0, 64), width=border_width)
        #draw.rectangle([(left, top), (right, bottom)], outline=(255, 0, 0, 255), width=border_width)

    # Save or display the image for verification
    return Image.alpha_composite(image, overlay)


def overlay_arrow(image, boxes):
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    # Create a drawing object
    overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')

    # Draw arrow on the right-hand side of the box
    border_width = 5
    for box in boxes:
        right = get_prop(box, 'right') + 20
        center_y = get_prop(box, 'top') + (get_prop(box, 'bottom') - get_prop(box, 'top')) / 2

        # Draw an arrow pointing at the box from the right side
        draw.line([(right, center_y), (right + 100, center_y)], fill=(255, 0, 0, 128), width=border_width)
        draw.line([(right, center_y), (right + 50, center_y + 20)], fill=(255, 0, 0, 128), width=border_width)
        draw.line([(right, center_y), (right + 50, center_y - 20)], fill=(255, 0, 0, 128), width=border_width)

    # Save or display the image for verification
    return Image.alpha_composite(image, overlay)


# def get_points(image, output_string):
#     h, w = image.size
#     if 'points' in output_string:
#         # Handle multiple coordinates
#         matches = re.findall(r'(x\d+)="([\d.]+)" (y\d+)="([\d.]+)"', output_string)
#         coordinates = [(round(float(x_val) / 100 * w), round(float(y_val) / 100 * h)) for _, x_val, _, y_val in matches]
#     else:
#         # Handle single coordinate
#         match = re.search(r'x="([\d.]+)" y="([\d.]+)"', output_string)
#         if match:
#             coordinates = [(round(float(match.group(1)) / 100 * w), round(float(match.group(2)) / 100 * h))]
            
#     return coordinates

def draw_points(image: Image.Image, points=None):
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    h, w = image.size
      
    # Create a drawing object
    overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')
    
    for (p1, p2) in points:
        # PIL library draw circle
        draw.ellipse((p1-5, p2-5, p1+5, p2+5), fill=(0, 255, 0, 128))

        # draw.point((p1, p2), fill=(0, 255, 0))
        # image = cv2.circle(
        #     image, 
        #     (p1, p2), 
        #     radius=5, 
        #     color=(0, 255, 0), 
        #     thickness=5,
        #     lineType=cv2.LINE_AA
        # )
    return Image.alpha_composite(image, overlay)

def get_distance_from_point(coords_list, point):
    """
    Calculate distances from a point to each set of coordinates in coords_list.
    Each coords in coords_list should be in format [x1, y1, x2, y2] (box coordinates).
    Point should be in format [x, y].
    Returns list of distances.
    """
    distances = []
    point_x, point_y = point[0], point[1]
    
    for coords in coords_list:

      if (is_contained_within(Box(left=point_x, top=point_y, right=point_x, bottom=point_y), coords)):
        distances.append(0)
      else:
        # Convert box coordinates to center point
        center_x = (coords["left"] + coords["right"]) / 2  # (x1 + x2) / 2
        center_y = (coords["top"] + coords["bottom"]) / 2  # (y1 + y2) / 2
        
        # Calculate Euclidean distance
        distance = ((point_x - center_x) ** 2 + (point_y - center_y) ** 2) ** 0.5
        distances.append(distance)
    
    return distances

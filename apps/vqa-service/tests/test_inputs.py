import json
import re
from TestBase import TestBase
from query import runQueryRaw
from testdata import load_image, load_json
from run_endpoint_query import MAX_RESOLUTION, Box, run_endpoint_query
from PIL import ImageDraw, Image
import os
from etransfer_data import InputTypeResponse, query_input_type, typesStr


test_folder = os.environ.get("PRIVATE_TESTING_PAGES", "~/")
samples_folder = os.path.join(test_folder, "unit-tests", "samples", "RBC")


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
  #     coords = get_coords(response)

  #     annotated = draw_points(test_image, coords)
  #     annotated.show()

  #     print("Done")

  async def test_isolate_form(self):
    for i in range(1, 6):
      test_data = load_json(samples_folder + f"/{i}-page-inputs.json")
      test_image = load_image(samples_folder + f"/{i}-page.png", MAX_RESOLUTION)
      validation_data = load_json(samples_folder + f"/{i}-inputs.json")

      elements = test_data['elements']
      parentCoords = test_data['parentCoords']
      validations = validation_data['inputs']

      grouping = calculate_element_groups(elements, parentCoords)
      boxes = calculate_group_boxes(grouping, parentCoords)

      # First, trim the image down to just the form
      response = runQueryRaw(test_image, "Point to the four corners of the \"Send etransfer\" form on this webpage", 1000)
      form_coords = get_coords(test_image, response)

      top = min(map(lambda c: c[1], form_coords))
      left = min(map(lambda c: c[0], form_coords))
      right = max(map(lambda c: c[0], form_coords))
      bottom = max(map(lambda c: c[1], form_coords))

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
        group_validations = [validations[idx] for idx in group]
        print (f"Got {response.info}, expected {group_validations}")

      print("Done")   


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
  return el_inputType if (el_inputType is not None and el_inputType != "text") else el_tagName

def get_query(elements: list):
  best_types = [get_element_type(el) for el in elements]
  best_type = best_types[0] if len(set(best_types)) == 1 else "inputs"

  all_props = [get_element_props(el) for el in elements]
  query_props = merge_element_props(all_props)
      
  base_q = f"the {best_type} in the red shaded region has the following properties: {json.dumps(query_props)}"

  it_them = "it" if len(elements) == 1 else "them"

  query_part = "What kind of information can be entered into {}?".format(it_them)

  if (best_type == "radio" or best_type == "select"):
    query_part = "What kind of information can be chosen by {}?".format(it_them)

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
        'top': min(box['top'], coords['top']),
        'left': min(box['left'], coords['left']),
        'bottom': max(box['bottom'], coords['bottom']),
        'right': max(box['right'], coords['right'])
      }
    boxes.append(box)
  return boxes

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
        left = box['left'] - border_padding
        top = box['top'] - border_padding
        right = box['right'] + border_padding
        bottom = box['bottom'] + border_padding
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
        right = box['right'] + 20
        center_y = box['top'] + (box['bottom'] - box['top']) / 2

        # Draw an arrow pointing at the box from the right side
        draw.line([(right, center_y), (right + 100, center_y)], fill=(255, 0, 0, 128), width=border_width)
        draw.line([(right, center_y), (right + 50, center_y + 20)], fill=(255, 0, 0, 128), width=border_width)
        draw.line([(right, center_y), (right + 50, center_y - 20)], fill=(255, 0, 0, 128), width=border_width)

    # Save or display the image for verification
    return Image.alpha_composite(image, overlay)


def get_coords(image, output_string):
    h, w = image.size
    if 'points' in output_string:
        # Handle multiple coordinates
        matches = re.findall(r'(x\d+)="([\d.]+)" (y\d+)="([\d.]+)"', output_string)
        coordinates = [(round(float(x_val) / 100 * w), round(float(y_val) / 100 * h)) for _, x_val, _, y_val in matches]
    else:
        # Handle single coordinate
        match = re.search(r'x="([\d.]+)" y="([\d.]+)"', output_string)
        if match:
            coordinates = [(round(float(match.group(1)) / 100 * w), round(float(match.group(2)) / 100 * h))]
            
    return coordinates

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

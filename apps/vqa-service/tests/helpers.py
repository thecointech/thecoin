import unittest
from PIL import Image

request_json = "Return only valid JSON data in the following format:"
element_desc = '{"content": "text", "font_color": "#color", "background_color": "#color", "neighbour_text": "text", "position_x": "number", "position_y": "number"}'


def normalize(str: str):
    str = str.lower()
    str = str.replace(" ", "")  # login == log in
    return str


def cast_value(response, key, scale):
    if key in response:
        try:
            response[key] = round(scale * float(response[key]) / 100)
        except ValueError:
            print("Invalid value for " + key + ": " + response[key])
            response[key] = None


def validate_response(response: dict, image: Image, original: dict, test: unittest.TestCase):
    cast_value(response, "position_x", image.width)
    cast_value(response, "position_y", image.height)

    test.assertIn(normalize(original["text"]), normalize(response["content"]))

    o_width = original["coords"]["width"]
    o_height = original["coords"]["height"]
    o_left = original["coords"]["left"]
    o_top = original["coords"]["top"]
    # be very generous with the bounds.  It should score points if there is
    # any potential overlap of the two bounding boxes
    xValid = (
        response["position_x"] > (o_left - o_width * 0.2) and
        response["position_x"] < (o_left + o_width * 1.2)
    )
    yValid = (
        response["position_y"] > (o_top - o_height * 0.2) and
        response["position_y"] < (o_top + o_height * 1.2)
    )
    test.assertTrue(xValid and yValid)

    # siblingText is quite restrictive, so it may not have any values
    # if it does, then there should be a match (except in Scotiabank)
    o_neigbours = [normalize(s) for s in original["siblingText"]]
    if (normalize(response["neighbour_text"]) in o_neigbours):
        # This can be wrong because it might pick up neighbours above/below
        # so just reassure ourselves when we do get it right :-)
        # test.assertIn(normalize(response["neighbour_text"]), o_neigbours)
        print("Found: " + normalize(response["neighbour_text"]) + " in " + str(o_neigbours))

    print("Element Found Correctly")

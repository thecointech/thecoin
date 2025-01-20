from TestBase import TestBase
from intent_data import PageType, IntentResponse
from testdata import get_test_data, load_image, load_json
from intent_routes import page_intent
from run_endpoint_query import MAX_RESOLUTION, Crop
from PIL import ImageDraw, Image

test_base = "/src/testing_pages/unit-tests/samples"
class TestIntentProcess(TestBase):

  def test_generating_input_highlights(self):

    for i in range(1, 6):
      test_data = load_json(test_base + f"/{i}-page-inputs.json")
      test_image = load_image(test_base + f"/{i}-page.png", MAX_RESOLUTION)

      # Generate the image with inputs highlighted
      out = overlay_image(test_image, test_data['parentCoords'])
      out.save(test_base + f"/{i}-page-highlights.png")
      out.show()

  def test_highlighted_inputs(self):
    for i in range(1, 6):
      test_data = load_json(test_base + f"/{i}-page-inputs.json")
      test_image = load_image(test_base + f"/{i}-page.png", MAX_RESOLUTION)

      for box in test_data['parentCoords']:
        highlighted_image = overlay_image(test_image, [box])

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
        right = left + box['width'] + (border_padding * 2)
        bottom = top + box['height'] + (border_padding * 2)
        # Draw rectangle with 50% opaque red (255, 0, 0, 128)
        draw.rectangle([(left, top), (right, bottom)], outline=(255, 0, 0, 128), width=border_width)

    # Save or display the image for verification
    return Image.alpha_composite(test_image, overlay)

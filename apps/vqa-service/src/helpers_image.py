from PIL import Image, ImageDraw
from geo_math import BBox


def overlay_image(image: Image.Image, boxes: list[BBox]) -> Image.Image:
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    # Create a drawing object
    overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')

    # Draw semi-transparent red rectangles for each coordinate
    # border_padding = 10
    for box in boxes:
        # enlarged = box.add(border_padding)
        # Draw rectangle with 50% opaque red (255, 0, 0, 128)
        draw.rectangle(box, fill=(255, 0, 0, 64))

    # Save or display the image for verification
    return Image.alpha_composite(image, overlay)
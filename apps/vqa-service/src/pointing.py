
from shapely.geometry import Point
from geo_math import BBox
from typing import Optional
from PIL import Image, ImageDraw
import re


def get_points(image: Image.Image, output_string: str, crop: Optional[BBox] = None) -> list[Point]:
    w = image.width
    h = image.height
    if 'points' in output_string:
        # Handle multiple coordinates
        matches = re.findall(r'(x\d+)="([\d.]+)" (y\d+)="([\d.]+)"', output_string)
        coordinates = [Point(round(float(x_val) / 100 * w), round(float(y_val) / 100 * h)) for _, x_val, _, y_val in matches]
    else:
        # Handle single coordinate
        match = re.search(r'x="([\d.]+)" y="([\d.]+)"', output_string)
        if match:
            coordinates = [Point(round(float(match.group(1)) / 100 * w), round(float(match.group(2)) / 100 * h))]
            
    if crop != None:
        coordinates = [Point(p1 + crop.left, p2 + crop.top) for (p1, p2) in coordinates]
    return coordinates


def draw_points(image: Image.Image, points: list[Point], fill=(0, 255, 0, 128), point_size=5):
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
      
    # Create a drawing object
    overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')
    
    for p in points:
        # PIL library draw circle
        draw.ellipse((p.x-point_size, p.y-point_size, p.x+point_size, p.y+point_size), fill=fill) 

    return Image.alpha_composite(image, overlay)
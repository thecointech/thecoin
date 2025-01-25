import re
from PIL import Image, ImageDraw
from pydantic import BaseModel, Field
from typing import Optional
from fastapi import UploadFile

from run_endpoint_query import Box

# from run_endpoint_query import MAX_RESOLUTION, Crop

# class ImageQueryRequest(BaseModel):
#     # image: UploadFile

#     query: str = Field(
#         ...,
#         description="Your question or prompt about the image",
#         example="What objects can you see in this image?",
#         json_schema_extra={"format": "textarea"}
#     )

#     json_description: Optional[str] = Field(
#         None,
#         description="A description of the JSON response",
#         example="Return only valid JSON data in the following format: {{\"description\": \"string\"}}",
#         json_schema_extra={"format": "textarea"}
#     )

#     # crop: Optional[Crop] = Field(
#     #     None,
#     #     description="The crop of the image to use",
#     # )

class ImageQueryResponse(BaseModel):
    result: str = Field(..., description="The generated response to your query about the image")


def get_points(image, output_string, crop: Optional[Box] = None):
    w = image.width
    h = image.height
    if 'points' in output_string:
        # Handle multiple coordinates
        matches = re.findall(r'(x\d+)="([\d.]+)" (y\d+)="([\d.]+)"', output_string)
        coordinates = [(round(float(x_val) / 100 * w), round(float(y_val) / 100 * h)) for _, x_val, _, y_val in matches]
    else:
        # Handle single coordinate
        match = re.search(r'x="([\d.]+)" y="([\d.]+)"', output_string)
        if match:
            coordinates = [(round(float(match.group(1)) / 100 * w), round(float(match.group(2)) / 100 * h))]
            
    if crop != None:
        coordinates = [(p1 + crop.left, p2 + crop.top) for (p1, p2) in coordinates]
    return coordinates


def draw_points(image: Image.Image, points=None, fill=(0, 255, 0, 128), point_size=5):
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
      
    # Create a drawing object
    overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')
    
    for (p1, p2) in points:
        # PIL library draw circle
        draw.ellipse((p1-point_size, p2-point_size, p1+point_size, p2+point_size), fill=fill) 

    return Image.alpha_composite(image, overlay)
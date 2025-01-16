from PIL import Image
import io
from fastapi import UploadFile
from query import runQueryToJson
from typing import TypeVar, Union
from collections import namedtuple


MAX_RESOLUTION = 2 ** 16
Crop = namedtuple('Crop', ['left', 'top', 'right', 'bottom'], defaults=[0, 0, MAX_RESOLUTION, MAX_RESOLUTION])


T = TypeVar('T')
# type QueryData = tuple[str, Type[T]] # Can we update to Python 3.12?
async def run_endpoint_query(image: Union[UploadFile, Image.Image], data: tuple[str, T], crop: Crop = None) -> T:

    (image, dim) = await get_image(image, crop)
    # Run query with PIL Image
    response = runQueryToJson(
        image=image,
        query_data=data,
    )

    try:
        position_to_pixels(response, dim)
        return data[1](**response)

    except Exception as e:
        print(f"Error parsing response: {response}")
        raise e


async def get_image(image: Union[UploadFile, Image.Image], crop: Crop=None) -> Image.Image:
        # If image is UploadFile, convert to PIL Image
    if isinstance(image, UploadFile):
        # read image data
        image_data = await image.read()
        image = Image.open(io.BytesIO(image_data))

    (left, top, right, bottom) = (0, 0, image.width, image.height)
    
        # If crop is provided, crop the image
    if crop is not None:
        (left, top, right, bottom) = crop
        if right > image.width:
            right = image.width
        if bottom > image.height:
            bottom = image.height
        image = image.crop((left, top, right, bottom))

    return (image, Crop(left, top, right, bottom))


def position_to_pixels(r, crop):

    width = crop.right - crop.left
    height = crop.bottom - crop.top

    cast_value(r, "position_x", width, crop.left)
    cast_value(r, "position_y", height, crop.top)

    return r

def cast_value(response, key, scale, adjust=0):
    if key in response:
        try:
            response[key] = round(scale * float(response[key]) / 100) + adjust
        except ValueError:
            print(f"Invalid value for {key}: {response[key]}")
            response[key] = None

        return response[key]

    # search recursively through the object
    if isinstance(response, dict):
        for k, v in response.items():
            if isinstance(v, dict):
                cast_value(v, key, scale)
            elif (isinstance(v, list)):
                for item in v:
                    cast_value(item, key, scale)

    return None


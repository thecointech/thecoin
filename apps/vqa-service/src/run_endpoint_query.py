from PIL import Image
import io
# NOTE - Don't use the instance from fastapi,
# as the isinstance check will fail with this type
from starlette.datastructures import UploadFile
from query import runQueryToJson
from typing import TypeVar, Union
from pydantic import BaseModel


MAX_RESOLUTION = 2 ** 16
class Crop(BaseModel):
    left: int = 0
    top: int = 0
    right: int = MAX_RESOLUTION
    bottom: int = MAX_RESOLUTION

    def __init__(self, left, top, right, bottom):
        super().__init__()
        self.left = left
        self.top = top
        self.right = right
        self.bottom = bottom


T = TypeVar('T')
# type QueryData = tuple[str, Type[T]] # Can we update to Python 3.12?
async def run_endpoint_query(image: Union[UploadFile, Image.Image], data: tuple[str, T], crop: Crop = None) -> T:

    (image, crop) = await get_image(image, crop)
    # Run query with PIL Image
    response = runQueryToJson(
        image=image,
        query_data=data,
    )

    try:
        position_to_pixels(response, crop)
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
        left = crop.left
        top = crop.top
        right = min(crop.right, image.width)
        bottom = min(crop.bottom, image.height)
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


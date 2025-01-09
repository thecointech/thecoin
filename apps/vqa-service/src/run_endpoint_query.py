from PIL import Image
import io
from fastapi import UploadFile
from query import runQuery
from typing import TypeVar

T = TypeVar('T')
# type QueryData = tuple[str, Type[T]] # Can we update to Python 3.12?
async def run_endpoint_query(image: UploadFile, data: tuple[str, T]) -> T:
    # Validate file type
    # if not image.filename or '.' not in image.filename:
    #     raise HTTPException(status_code=400, detail="Invalid file format")

    # read image data
    image_data = await image.read()
    image = Image.open(io.BytesIO(image_data))

    response = runQuery(
        query_data=data,
        image=image,
    )
    try:
        return data[1](**response)
    except Exception as e:
        print(f"Error parsing response: {response}")
        raise e

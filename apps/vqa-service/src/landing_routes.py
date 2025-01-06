from fastapi import UploadFile
from PIL import Image
import io

from helpers import get_instruct_json_respose
from query import runQuery
from data_landing import *
from data_elements import ElementResponse
from typing import TypeVar

T = TypeVar('T')
# type QueryData = tuple[str, Type[T]] # Can we update to Python 3.12?
async def run_endpoint_query(image: UploadFile, data: tuple[str, T]) -> T:
    # Validate file type
    if not image.filename or '.' not in image.filename:
        raise HTTPException(status_code=400, detail="Invalid file format")

    # read image data
    image_data = await image.read()
    image = Image.open(io.BytesIO(image_data))

    query = f"{data[0]} {get_instruct_json_respose(data[1].schema())}"
    
    response = runQuery(
        query=query,
        image=image,
    )
    return data[1](**response)

def add_landing_routes(app):

    @app.post("/landing/cookie-banner-present")
    async def cookie_banner_present(image: UploadFile) -> ExistsResponse:
        return await run_endpoint_query(image, query_cookie_exists)

    @app.post("/landing/cookie-banner-accept")
    async def cookie_banner_accept(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_cookie_accept)

    @app.post("/landing/navigate-to-login")
    async def navigate_to_login(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_navigate_to_login)
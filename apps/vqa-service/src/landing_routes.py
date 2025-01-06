from fastapi import UploadFile
from landing_data import *
from data_elements import ElementResponse
from run_endpoint_query import run_endpoint_query


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
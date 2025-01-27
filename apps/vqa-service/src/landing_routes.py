from fastapi import UploadFile, APIRouter
from data_elements import ElementResponse
from geo_math import BBox
from landing_data import ExistsResponse, query_cookie_exists, query_cookie_accept, query_navigate_to_login, query_navigate_to_login_menu
from run_endpoint_query import run_endpoint_query

router = APIRouter()

@router.post("/landing/cookie-banner-present", tags=["landing"])
async def cookie_banner_present(image: UploadFile) -> ExistsResponse:
    return await run_endpoint_query(image, query_cookie_exists)

@router.post("/landing/cookie-banner-accept", tags=["landing"])
async def cookie_banner_accept(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_cookie_accept)

@router.post("/landing/navigate-to-login", tags=["landing"])
async def navigate_to_login(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_navigate_to_login)

@router.post("/landing/navigate-to-login-menu", tags=["landing"])
async def navigate_to_login_menu(image: UploadFile, crop: BBox = None) -> ElementResponse:
    return await run_endpoint_query(image, query_navigate_to_login_menu, crop)

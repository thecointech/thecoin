from fastapi import UploadFile, APIRouter
from data_elements import ElementResponse
from helpers_image import overlay_image
from run_endpoint_query import get_image, run_endpoint_query
from geo_math import BBox
from twofa_data import *

router = APIRouter()

@router.post("/twofa/detect-action-required", tags=["twofa"])
async def detect_action_required(image: UploadFile) -> TwoFactorActionRequiredResponse:
    return await run_endpoint_query(image, query_page_2fa_action)

@router.post("/twofa/detect-destinations", tags=["twofa"])
async def detect_destinations(image: UploadFile) -> TwoFactorDestinationsResponse:
    (readImage, _) = await get_image(image)
    emails = await run_endpoint_query(readImage, query_2fa_email_destinations)
    phones = await run_endpoint_query(readImage, query_2fa_phone_destinations)
    return TwoFactorDestinationsResponse(phones=phones, emails=emails)

@router.post("/twofa/get-destination-elements", tags=["twofa"])
async def get_destination_elements(image: UploadFile, phone: str, top: float, left: float, width: float, height: float) -> TwoFactorElementsResponse:
    query = get_2fa_elements_for_phone(phone)
    box = BBox(left=left, top=top, right=left+width, bottom=top+height)
    (readImage, _) = await get_image(image)
    highlighted_image = overlay_image(readImage, [box])
    return await run_endpoint_query(highlighted_image, query)

@router.post("/twofa/get-auth-input", tags=["twofa"])
async def get_auth_input(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_2fa_input_element)

@router.post("/twofa/get-remember-input", tags=["twofa"])
async def get_remember_input(image: UploadFile) -> RememberMeElementResponse:
    return await run_endpoint_query(image, query_2fa_remember_element)

@router.post("/twofa/get-submit-input", tags=["twofa"])
async def get_submit_input(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_2fa_submit_element)

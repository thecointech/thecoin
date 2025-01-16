from fastapi import UploadFile, APIRouter
from data_elements import ElementResponse
from run_endpoint_query import run_endpoint_query
from twofa_data import *

router = APIRouter()

@router.post("/twofa/detect-action-required", tags=["twofa"])
async def detect_action_required(image: UploadFile) -> TwoFactorActionRequiredResponse:
    return await run_endpoint_query(image, query_page_2fa_action)

@router.post("/twofa/detect-destinations", tags=["twofa"])
async def detect_destinations(image: UploadFile) -> TwoFactorDestinationsResponse:
    return await run_endpoint_query(image, query_page_2fa_destinations)

@router.post("/twofa/get-destination-elements", tags=["twofa"])
async def get_destination_elements(image: UploadFile, phone: str) -> TwoFactorElementsResponse:
    query = get_2fa_elements_for_phone(phone)
    return await run_endpoint_query(image, query)

@router.post("/twofa/get-auth-input", tags=["twofa"])
async def get_auth_input(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_2fa_input_element)

@router.post("/twofa/get-remember-input", tags=["twofa"])
async def get_remember_input(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_2fa_remember_element)

@router.post("/twofa/get-submit-input", tags=["twofa"])
async def get_submit_input(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_2fa_submit_element)

# Errors: TODO: Can we not create a generic endpoint for this?

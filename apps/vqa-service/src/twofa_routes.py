from fastapi import UploadFile
from data_elements import ElementResponse
from run_endpoint_query import run_endpoint_query
from twofa_data import LoginResultResponse, TwoFactorActionRequiredResponse, TwoFactorDestinationsResponse, TwoFactorElementsResponse
from twofa_data import query_login_result, query_page_2fa_action, get_2fa_elements_for_phone, query_page_2fa_destinations, query_2fa_input_element, query_2fa_skip_element, query_2fa_submit_element


def add_twofa_routes(app):

    @app.post("/twofa/detect-action-required", tags=["twofa"])
    async def detect_action_required(image: UploadFile) -> TwoFactorActionRequiredResponse:
        return await run_endpoint_query(image, query_page_2fa_action)

    @app.post("/twofa/detect-destinations", tags=["twofa"])
    async def detect_destinations(image: UploadFile) -> TwoFactorDestinationsResponse:
        return await run_endpoint_query(image, query_page_2fa_destinations)

    @app.post("/twofa/get-destination-elements", tags=["twofa"])
    async def get_destination_elements(image: UploadFile, phone: str) -> TwoFactorElementsResponse:
        query = get_2fa_elements_for_phone(phone)
        return await run_endpoint_query(image, query)

    @app.post("/twofa/get-auth-input", tags=["twofa"])
    async def get_auth_input(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_2fa_input_element)

    @app.post("/twofa/get-skip-input", tags=["twofa"])
    async def get_skip_input(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_2fa_skip_element)

    @app.post("/twofa/get-submit-input", tags=["twofa"])
    async def get_submit_input(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_2fa_submit_element)

    # Errors: TODO: Can we not create a generic endpoint for this?

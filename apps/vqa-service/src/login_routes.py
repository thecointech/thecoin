from fastapi import UploadFile, APIRouter
from login_data import *
from data_elements import ElementResponse
from run_endpoint_query import get_image, run_endpoint_query
from pydantic import BaseModel

router = APIRouter()

@router.post("/login/detect-username-input", tags=["login"])
async def detect_username_input(image: UploadFile) -> InputElementResponse:
    return await run_endpoint_query(image, query_username_element)

@router.post("/login/detect-password-exists", tags=["login"])
async def detect_password_exists(image: UploadFile) -> PasswordDetectedResponse:
    return await run_endpoint_query(image, query_pwd_exists)

@router.post("/login/detect-password-input", tags=["login"])
async def detect_password_input(image: UploadFile) -> InputElementResponse:
    return await run_endpoint_query(image, query_password_element)

@router.post("/login/detect-continue-element", tags=["login"])
async def detect_continue_element(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_continue_button)

@router.post("/login/detect-login-element", tags=["login"])
async def detect_login_element(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_login_button)

@router.post("/login/detect-login-error", tags=["login"])
async def detect_login_error(image: UploadFile) -> ErrorResponse:
    return await run_endpoint_query(image, query_error_message)

@router.post("/login/detect-login-result", tags=["login"])
async def detect_login_result(image: UploadFile) -> LoginResultResponse:
    return await run_endpoint_query(image, query_login_result)

##############################################################################
query_logout_element = (
    "What is the element in this page that is the most likely to enable the user to logout.",
    ElementResponse
)
@router.post("/login/detect-logout-element", tags=["login"])
async def detect_logout_element(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_logout_element)

##############################################################################
class SessionTimeout(BaseModel):
    timeout_warning_present: bool

query_session_timout_exists = (
    "Is the page warning the user their session is about to timeout?",
    SessionTimeout
)
query_session_timeout_continue = (
    "Describe the button to continue the session and keep the user signed in.",
    ElementResponse
)
@router.post("/login/detect-session-timeout-element", tags=["login"])
async def detect_session_timeout_element(image: UploadFile) -> ElementResponse|None:
    (loaded, _) = await get_image(image)
    timeout_warning = await run_endpoint_query(loaded, query_session_timout_exists)
    if timeout_warning.timeout_warning_present:
        return await run_endpoint_query(loaded, query_session_timeout_continue)
    return None

# Errors: TODO: Can we not create a generic endpoint for this?

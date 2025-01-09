from fastapi import UploadFile
from login_data import *
from data_elements import ElementResponse
from run_endpoint_query import run_endpoint_query


def add_login_routes(app):

    @app.post("/login/detect-username-input", tags=["login"])
    async def detect_username_input(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_username_element)

    @app.post("/login/detect-password-exists", tags=["login"])
    async def detect_password_exists(image: UploadFile) -> PasswordDetectedResponse:
        return await run_endpoint_query(image, query_pwd_exists)

    @app.post("/login/detect-password-input", tags=["login"])
    async def detect_password_input(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_password_element)

    @app.post("/login/detect-continue-element", tags=["login"])
    async def detect_continue_element(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_continue_button)

    @app.post("/login/detect-login-element", tags=["login"])
    async def detect_login_element(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_login_button)

    @app.post("/login/detect-login-error", tags=["login"])
    async def detect_login_error(image: UploadFile) -> ErrorResponse:
        return await run_endpoint_query(image, query_error_message)

    # Errors: TODO: Can we not create a generic endpoint for this?
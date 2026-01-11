from typing import Optional
from pydantic import BaseModel, Field
from data_elements import ElementResponse, PositionResponse
from case_insensitive_enum import CaseInsensitiveEnum

class PasswordDetectedResponse(BaseModel):
    password_input_detected: bool
    reasoning: str = Field(..., description="Explain why the password or pin input was detected or not detected")

class ErrorResponse(BaseModel):
    error_message_detected: bool = Field(..., description="boolean")
    error_message: str = Field(..., optional=True, description="Optionally contains error message only if error_message_detected is true")

class InputElementResponse(PositionResponse):
    placeholder_text: Optional[str] = Field(..., description="placeholder text inside the element or empty string")

query_username_element = (
    "Analyze the provided webpage. Describe the text input where the user can enter their username or card number. ",
    InputElementResponse
)
query_password_element = (
    "Analyze the provided webpage. Describe the text input where the user can enter their password. ",
    InputElementResponse
)
query_pwd_exists = (
    "Analyze the provided webpage. Is there a password or pin input present?",
    PasswordDetectedResponse
)
query_continue_button = (
    "Analyze the provided webpage. Describe the element to proceed to the next step.",
    ElementResponse
)
query_login_button = (
    "Describe the button to complete login on this webpage. It should be near the username and password inputs. ",
    ElementResponse
)
query_error_message = (
    "Analyze the provided webpage. If an error message that is preventing login is present, describe it.",
    ErrorResponse
)

class LoginResult(CaseInsensitiveEnum):
    LOGIN_SUCCESS = 'LoginSuccess'
    TWO_FACTOR_AUTH = 'TwoFactorAuth'
    LOGIN_ERROR = 'LoginError'
    OTHER_ERROR = 'OtherError'

loginTypesStr = ", ".join([e.value for e in LoginResult])
login_result_prompt = f"From the following options, select the one that best describes the login result for the given webpage: [{loginTypesStr}]"
loginResultEnumStr = "|".join([e.value for e in LoginResult])
class LoginResultResponse(BaseModel):
    result: LoginResult = Field(..., description=loginResultEnumStr)
    # error_message: Optional[str] = Field(..., description="error message only if result is LoginError")


query_login_result = (
    login_result_prompt,
    LoginResultResponse
)

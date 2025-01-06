from pydantic import BaseModel, Field
from data_elements import ElementResponse


class PasswordDetectedResponse(BaseModel):
    password_input_detected: bool

class ErrorResponse(BaseModel):
    error_message_detected: bool = Field(..., description="boolean")
    error_message: str = Field(..., optional=True, description="Optionally contains error message only if error_message_detected is true")

query_username_element = (
    "Analyze the provided webpage. Describe the input for the username or cardnumber.",
    ElementResponse
)
query_password_element = (
    "Describe the password text input in this webpage.",
    ElementResponse
)
query_pwd_exists = (
    "Is there a password input?",
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


from pydantic import BaseModel, Field
from data_elements import ElementResponse, PositionResponse
from case_insensitive_enum import CaseInsensitiveEnum


class TwoFactorActions(CaseInsensitiveEnum):
    SELECT_DESTINATION = 'SelectDestination'
    INPUT_CODE = 'InputCode'
    APPROVE_IN_APP = 'ApproveInApp'
    ERROR = 'Error'

class TwoFactorActionRequiredResponse(BaseModel):
    action: TwoFactorActions = Field(..., description="option")
    message: str = Field(..., description="The full message describing the 2-factor action required")

twoFactorActionsStr = ", ".join([e.value for e in TwoFactorActions])
action_prompt = f"From the following options, select the one that best describes the action required in the given webpage: [{twoFactorActionsStr}]"

query_page_2fa_action = (
    action_prompt,
    TwoFactorActionRequiredResponse
)

# action_prompt = f"From the following options, select the one that best describes the action required in the given webpage [SelectDestination, InputCode, ApproveInApp, Error] {get_instruct_json_respose(detect_2fa_action)}"

# class TwoFactorDestinationsResponse(BaseModel):
#     phone_nos: list[str] = Field(..., description="array of phone numbers")
#     emails: list[str] = Field(..., description="array of emails")

# What are the phone numbers we could send the two factor authentication code to?
# { phone_numbers: { "position_x": "x coordinate", "position_y": "y coordinate", "phone": "the phone number including masking" } }
class PhoneNumberElement(PositionResponse):
    phone_number: str = Field(..., description="the phone number including masking")

class PhoneDestinations(BaseModel):
    num_phone_numbers: int
    phone_nos: list[PhoneNumberElement]

class EmailElement(PositionResponse):
    email: str = Field(..., description="the exact text of the email address")

class EmailDestinations(BaseModel):
    num_emails: int
    emails: list[EmailElement]

class TwoFactorDestinationsResponse(BaseModel):
    phones: PhoneDestinations
    emails: EmailDestinations

# On this webpage, how many phone numbers are available as destinations to send the two-factor authentication code to?
# Point to the phone numbers on this webpage that we can send our two-factor authentication code to.  Return only JSON in the following format: {"num_phone_numbers": "integer", "phone_nos": [{"position_x": "number", "position_y": "number", "phone_number": "the phone number including masking"}]}
query_2fa_phone_destinations = (
    "Point to the phone numbers on this webpage that we can send our two-factor authentication code to.",
    PhoneDestinations
)
query_2fa_email_destinations = (
    "On this webpage, how many email addresses are available as destinations to send the two-factor authentication code to?",
    EmailDestinations
)
# get_destinations_prompt = f"Analyze the provided webpage. How many phone numbers or email addresses can we send two-factor codes to?"

# query_page_2fa_destinations = (
#     get_destinations_prompt,
#     TwoFactorDestinationsResponse
# )

#get_options_query = f"Analyze the provided webpage. Describe all the elements that will send a two-factor authentication code to {phone}.}"
class TwoFactorElementsResponse(BaseModel):
    buttons: list[ElementResponse]

def get_2fa_elements_for_phone(phone: str):
    return (
        f"In this webpage, the phone number \"{phone}\" is highlighted in red.  Describe the buttons that will send a code to this number.",
        TwoFactorElementsResponse
    )

query_2fa_input_element = (
    "Analyze the provided webpage. Describe the input for auth code.",
    ElementResponse
)

class RememberMeElementResponse(ElementResponse):
    is_checked: bool = Field(..., description="Is the checkbox checked?")

query_2fa_remember_element = (
    "Analyze the provided webpage. Describe the checkbox to remember the authentication code and skip next time.",
    RememberMeElementResponse
)

query_2fa_submit_element = (
    "Analyze the provided webpage. Describe the button to submit the authentication code.",
    ElementResponse
)

from pydantic import BaseModel, Field
from data_elements import ElementResponse
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

class TwoFactorDestinationsResponse(BaseModel):
    phone_nos: list[str] = Field(..., description="array of phone numbers")
    emails: list[str] = Field(..., description="array of emails")

get_destinations_prompt = f"Analyze the provided webpage. How many phone numbers or email addresses can we send two-factor codes to?"

query_page_2fa_destinations = (
    get_destinations_prompt,
    TwoFactorDestinationsResponse
)       

#get_options_query = f"Analyze the provided webpage. Describe all the elements that will send a two-factor authentication code to {phone}.}"
class TwoFactorElementsResponse(BaseModel):
    elements: list[ElementResponse]

get_elements_prompt = "Analyze the provided webpage. Describe all the elements that will send a two-factor authentication code to "
# query_page_2fa_elements = (
#     get_destinations_prompt,
#     TwoFactorElementsResponse
# )       

def get_2fa_elements_for_phone(phone: str):
    return (
        get_elements_prompt + phone + ".",
        TwoFactorElementsResponse
    )

query_2fa_input_element = (
    "Analyze the provided webpage. Describe the input for auth code.",
    ElementResponse
)

query_2fa_remember_element = (
    "Analyze the provided webpage. Describe the checkbox to remember the authentication code and skip next time.",
    ElementResponse
)

query_2fa_submit_element = (
    "Analyze the provided webpage. Describe the button to submit the authentication code.",
    ElementResponse
)


from pydantic import BaseModel, Field
from case_insensitive_enum import CaseInsensitiveEnum
from data_elements import ElementResponse


class InputType(CaseInsensitiveEnum):
    AMOUNT_TO_SEND = 'AmountToSend'
    TO_RECIPIENT = 'ToRecipient'
    FROM_ACCOUNT = 'FromAccount'
    # The VQA always tries to find a valid
    # response, so we need to include values
    # for likely inputs, even if they are not used  
    # (These should all be set prior to setup)
    SECRET_QUESTION = 'SecretQuestion'
    SECRET_ANSWER = 'SecretAnswer'
    # Name is too close to ToRecipient, so omit
    # TO_NAME = 'ToName'
    TO_EMAIL = 'ToEmail'
    TO_PHONE = 'ToPhone'
    LANGUAGE = 'Language'
    DATE = 'Date'
    FREQUENCY = 'Frequency'
    # Catch-all, 
    UNKNOWN = 'Unknown'

# Unique input types can only have a single occurence on a page
unique_input_types = [
    InputType.AMOUNT_TO_SEND,
    InputType.TO_RECIPIENT,
    InputType.FROM_ACCOUNT,
    InputType.SECRET_QUESTION,
    InputType.SECRET_ANSWER,

    # We include TO_EMAIL here just to ensure
    # we are clear between TO_RECIPIENT & TO_EMAIL
    # However, TO_PHONE is not included because
    # (a) it can have multiple inputs, and 
    # (b) we don't chare
    InputType.TO_EMAIL
]

class InputTypeResponse(BaseModel):
    info: InputType = Field(..., description="InputType")

class InputTypesResponse(BaseModel):
    types: list[InputType] = Field(..., description="matching input types")

typesStr = ", ".join([e.value for e in InputType])


class ConfirmationCodeResponse(ElementResponse):
    content: str = Field(..., description="the code that confirms successful etransfer")

query_confirmation_code = (
    "Describe the element that contains the confirmation code.",
    ConfirmationCodeResponse
)
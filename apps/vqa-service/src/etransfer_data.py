

from pydantic import BaseModel, Field
from case_insensitive_enum import CaseInsensitiveEnum


class InputType(CaseInsensitiveEnum):
    AMOUNT_TO_SEND = 'AmountToSend'
    TO_RECIPIENT = 'ToRecipient'
    FROM_ACCOUNT = 'FromAccount'
    SECRET_QUESTION = 'SecretQuestion'
    SECRET_ANSWER = 'SecretAnswer'
    DATE = 'Date'
    FREQUENCY = 'Frequency'
    UNKNOWN = 'Unknown'


class InputTypeResponse(BaseModel):
    info: InputType = Field(..., description="type or Unknown")

class InputTypesResponse(BaseModel):
    types: list[InputType] = Field(..., description="matching input types")

typesStr = ", ".join([e.value for e in InputType])

query_input_type = (
    f"From the following options, select the one that best describes the input highlighted with red: {typesStr}.",
    InputTypeResponse
)

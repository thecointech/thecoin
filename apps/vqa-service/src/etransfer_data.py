

import json
from pydantic import BaseModel, Field
from case_insensitive_enum import CaseInsensitiveEnum
from data_elements import ElementResponse


class FormPresentResponse(BaseModel):
    etransfer_form_present: bool
    reasoning: str = Field(..., description="Reasoning for the form presence")

query_etransfer_form_present = (
    "Analyze the provided screenshot of a webpage. Determine if a form for sending e-transfers is present.",
    FormPresentResponse
)


class ETransferLinkResponse(BaseModel):
    best_link: str
    reasoning: str = Field(..., description="Reasoning for the best link")

def get_find_etransfer_link_prompt(page_link_group: list[str]) -> tuple[str, ETransferLinkResponse]:
    return (
        "Which one of the following links is most likely to navigate to a page for sending an interac e-transfer? " + json.dumps(page_link_group),
        ETransferLinkResponse
    )

###################

class ETransferStage(CaseInsensitiveEnum):
    FILL_FORM = "FillForm"
    REVIEW_DETAILS = "ReviewDetails"
    CONFIRM_DETAILS = "ConfirmDetails"
    TRANSFER_COMPLETE = "TransferComplete"
    ERRORED = "Errored"
    
stageTypesStr = ", ".join([e.value for e in ETransferStage])

class ETransferStageResponse(BaseModel):
    stage: ETransferStage = Field(..., description="option")
    # reasoning: str = Field(..., description="explain your reasoning")

transfer_stage_prompt = "Anaylze this online banking page with the the title \"{title}\". From the following options, select the one that best describes current stage of sending an e-transfer: {stageTypesStr}."
transfer_error_prompt = " If any error messages are present, return { \"stage\": \"Errored\" }."

def query_etransfer_stage(title: str) -> tuple[str, ETransferStageResponse]:
    return (
        transfer_stage_prompt.format(title=title, stageTypesStr=stageTypesStr) + transfer_error_prompt,
        ETransferStageResponse
    )

####################

class ETransferFormPresentResponse(BaseModel):
    form_present: bool


class HasAddRecipientButtonResponse(BaseModel):
    button_present: bool
    reasoning: str = Field(..., description="Reasoning for the form presence")
    
def query_add_recipient_present(title: str) -> tuple[str, HasAddRecipientButtonResponse]:
    return (
        f"Does this webpage; titled '{title}'; include a link or a button for adding an e-transfer recipient?",
        HasAddRecipientButtonResponse
    )

####################
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

def query_to_recipient(recipient: str) -> ElementResponse:
    return (
        f"Analyze the provided webpage. What is the combobox element that contains the recipient '{recipient}'?",
        ElementResponse
    )

class SimilarityResponse(BaseModel):
    most_similar: str = Field(..., description="the option most similar to the target")
    reasoning: str = Field(..., description="your reasoning")

def query_most_similar(target: str, options: list[str]) -> SimilarityResponse:
    return (
        f"From this list of options: {json.dumps(options)}, which option is the most similar to this target '{target}'?",
        SimilarityResponse
    )

class ButtonResponse(ElementResponse):
    content: str = Field(..., description="button text")
    enabled: bool
    
class NextStepExistsResponse(BaseModel):
    next_button_visible: bool
    reasoning: str = Field(..., description="explain your reasoning")



query_next_button_exists = (
    "Is there a button clearly visible for proceeding to the next step of sending an e-transfer?",
    NextStepExistsResponse
)
query_next_button = (
    "Describe the button for proceeding to the next step of sending an e-transfer",
    ButtonResponse
)
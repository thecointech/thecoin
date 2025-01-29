from pydantic import BaseModel, Field
from case_insensitive_enum import CaseInsensitiveEnum


class PageType(CaseInsensitiveEnum):
    LANDING = 'Landing'
    LOGIN = 'Login'
    # It seems we can't reliably detect the
    # difference between login & 2FA when executed
    # like this, so that detection is split
    # into it's own distinct test
    # TWO_FACTOR_AUTH = 'TwoFactorAuth'
    ACCOUNTS_SUMMARY = 'AccountsSummary'
    CREDIT_ACCOUNT_DETAILS = 'CreditAccountDetails'
    PAY_BILL = 'PayBill'
    SEND_TRANSFER = 'SendTransfer'
    MODAL_DIALOG = 'ModalDialog'   # Is there a modal dialog that needs to be closed?
    MENU_SELECT = 'MenuSelect'     # Is there a menu select with a choise to be chosen?
    BLANK = 'Blank'                # If the page hasn't loaded anything yet.
    LOADING = 'Loading'            # If the page has a loading indicator up
    # ERROR_MESSAGE = 'ErrorMessage' # TODO: Add error message detection


class IntentResponse(BaseModel):
    type: PageType = Field(..., description="option")


typesStr = ", ".join([e.value for e in PageType])
intent_prompt = "From the following options, select the one that best describes the given webpage with the title \"{title}\": {typesStr}."

def query_page_intent(title: str):
    return (
        intent_prompt.format(title=title, typesStr=typesStr),
        IntentResponse
    )

#####################


class DetectErrorResponse(BaseModel):
    error_message_detected: bool = Field(..., description="boolean")
    error_message: str|None = Field(..., optional=True, description="Optionally contains error message only if error_message_detected is true")


query_error_message = (
    "Is there an error message on this web page?",
    DetectErrorResponse
)
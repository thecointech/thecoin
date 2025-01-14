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
    ACCOUNT_DETAILS = 'AccountDetails'
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
intent_prompt = f"From the following options, select the one that best describes the given webpage: {typesStr}."

query_page_intent = (
    intent_prompt,
    IntentResponse
)

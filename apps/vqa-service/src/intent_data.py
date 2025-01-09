from enum import Enum
from pydantic import BaseModel, Field


class PageType(str, Enum):
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
    MODAL_DIALOG = 'ModalDialog'
    LOADING = 'Loading'
    ERROR_MESSAGE = 'ErrorMessage'


class IntentResponse(BaseModel):
    type: PageType = Field(..., description="option")


typesStr = ", ".join([e.value for e in PageType])
intent_prompt = f"From the following options, select the one that best describes the given webpage: {typesStr}."

query_page_intent = (
    intent_prompt,
    IntentResponse
)

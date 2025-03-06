from pydantic import BaseModel, Field
from data_elements import ElementResponse, MoneyElementResponse, PositionResponse
from case_insensitive_enum import CaseInsensitiveEnum

#json_part = request_json + f"{{ \"num_accounts\": \"number\", \"accounts\": [{{\"account_type\": \"Chequing|Savings|Credit\", \"account_number\": \"string\", \"balance\": \"string\", \"position_x\": \"number\", \"position_y\": \"number\" }}] }}"
# list_accounts_query = f"Analyze the provided webpage. How many bank accounts with a balance does the user have? {json_part}"


class AccountType(CaseInsensitiveEnum):
    CHEQUING = "Chequing"
    SAVINGS = "Savings"
    CREDIT = "Credit"

class AccountResponse(BaseModel):
    account_type: AccountType
    account_name: str
    account_number: str = Field(..., description="Account number including any stars or asterisks")
    balance: str
    position_x: float
    position_y: float

class OverviewResponse(BaseModel):
    num_accounts: int
    accounts: list[AccountResponse]

list_accounts_prompt = "Analyze the provided webpage. How many bank accounts with a balance does the user have?"

list_accounts_query = (
    list_accounts_prompt,
    OverviewResponse
)

# json_part = get_instruct_json_respose(element_schema)
# find_account_balance_query = f"Analyze the provided webpage. Describe the element that contains the balance for this account \"{account_number}\". {json_part}"

find_account_balance_prompt = "Analyze the provided webpage. Describe the element that contains the balance for this account \"{account_number}\"."
def get_query_account_balance(account_number: str):
    return (
        find_account_balance_prompt.format(account_number=account_number),
        MoneyElementResponse
    )

# json_part = get_instruct_json_respose(element_schema)
# find_navigation_query = f"Analyze the provided webpage. For account \"{account_number}\", describe the link to navigate to it's details page. {json_part}"

# find_navigation_prompt = "Analyze the provided webpage. For account \"{account_number}\", describe the link to navigate to it's details page."
# def get_query_navigation(account_number: str):
#     return (
#         find_navigation_prompt.format(account_number=account_number),
#         ElementResponse
#     )


find_navigation_prompt = "Describe the link to navigate to account \"{account_number}\"."
def get_query_navigation(account_number: str):
    return (
        find_navigation_prompt.format(account_number=account_number),
        PositionResponse
    )
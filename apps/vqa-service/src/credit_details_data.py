
from pydantic import BaseModel, Field
from data_elements import ElementResponse

#find_current_balance_query = f"Analyze this credit card account. Describe the element that contains the current balance amount. {json_part}"
#json_part = get_instruct_json_respose(element_schema)   

query_current_balance_element = (
    "Analyze this credit card account. Describe the element that contains the current balance amount.",
    ElementResponse
)
            
# pending_json_part = request_json + f"{{ \"pending_exists\": \"boolean\", \"pending_element\": {{ \"content\": \"dollar amount\", \"neighbour_text\": \"Text immediately beside or above the element\", \"font_color\": \"#FFFFFF\", \"background_color\": \"#FFFFFF\", \"position_x\": \"number\", \"position_y\": \"number\"}} }}"
# find_pending_balance_query = f"Analyze the provided credit card details webpage. Is there an amount pending? {pending_json_part}"

class MoneyElementResponse(ElementResponse):
    content: str = Field(..., description="dollar amount")

class PendingBalanceResponse(BaseModel):
    pending_exists: bool
    pending_element: MoneyElementResponse

query_pending_balance_element = (
    "Analyze the provided credit card details webpage. Is there an amount pending?",
    PendingBalanceResponse
)

# find_due_amount_query = f"Analyze the provided credit card details webpage. Describe amount due for the previous period. {json_part}"

query_due_amount_element = (
    "Analyze the provided credit card details webpage. Describe amount due for the previous period.",
    ElementResponse
)

# find_due_date_query = f"Analyze the provided credit card details webpage. Describe the element that contains the due date. {json_part}"

class DateElementResponse(ElementResponse):
    content: str = Field(..., description="date string")

query_due_date_element = (
    "Analyze the provided credit card details webpage. Describe the element that contains the due date.",
    DateElementResponse
)
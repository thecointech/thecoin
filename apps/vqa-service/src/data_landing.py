from data_elements import get_exists_schema, element_schema, ElementResponse
from helpers import get_instruct_json_respose
from pydantic import BaseModel
# from enum import Enum

# class ElementType(str, Enum):
#     COOKIE = 'CloseModal'
#     LOGIN = 'Button'

class ExistsResponse(BaseModel):
    cookie_banner_detected: bool

# cookie_exists_schema = get_exists_schema("cookie_banner_detected")
query_cookie_exists = (
    "Analyze the provided screenshot of a webpage. Determine if a cookie banner is present. The cookie banner must contain a button that includes the word \"Accept\".",
    ExistsResponse
)
query_cookie_accept = (
    "Analyze the provided webpage. Describe the button to accept cookies and continue.",
    ElementResponse
)
query_navigate_to_login = (
    "In the provided webpage, describe the element that will navigate to the login page.",
    ElementResponse
)

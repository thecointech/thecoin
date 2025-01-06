from data_elements import get_exists_schema, element_schema
from helpers import get_instruct_json_respose
from enum import Enum

class ElementType(str, Enum):
    COOKIE = 'CloseModal'
    LOGIN = 'Button'

cookie_exists_schema = get_exists_schema("cookie_banner_detected")
query_cookie_exists = f"Analyze the provided screenshot of a webpage. Determine if a cookie banner is present. The cookie banner must contain a button that includes the word \"Accept\"."
query_cookie_accept = f"Analyze the provided webpage. Describe the button to accept cookies and continue. {get_instruct_json_respose(element_schema)}"
query_navigate_to_login = f"In the provided webpage, describe the element that will navigate to the login page.  {get_instruct_json_respose(element_schema)}"

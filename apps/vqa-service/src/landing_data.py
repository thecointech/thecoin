from data_elements import ElementResponse
from pydantic import BaseModel


class ExistsResponse(BaseModel):
    cookie_banner_detected: bool


query_cookie_exists = (
    "Analyze the provided screenshot of a webpage. Determine if a cookie banner is present. The cookie banner must contain a button that includes the word \"Accept\".",
    ExistsResponse
)
query_cookie_accept = (
    "Analyze the provided webpage. Describe the button to accept cookies and continue.",
    ElementResponse
)
query_navigate_to_login = (
    "In the provided webpage, describe the button or menu item that will login to the users online banking.",
    ElementResponse
)

query_navigate_to_login_menu = (
    "From the menu in this webpage, describe the item to login to the users online banking.",
    ElementResponse
)

from fastapi import UploadFile
from data_elements import ElementResponse
from run_endpoint_query import run_endpoint_query
from credit_details_data import *


def add_credit_details_routes(app):

    @app.post("/credit-details/current-balance", tags=["credit-details"])
    async def current_balance(image: UploadFile) -> MoneyElementResponse:
        return await run_endpoint_query(image, query_current_balance_element)

    @app.post("/credit-details/current-pending", tags=["credit-details"])
    async def current_pending(image: UploadFile) -> PendingBalanceResponse:
        return await run_endpoint_query(image, query_pending_balance_element)

    @app.post("/credit-details/current-due-amount", tags=["credit-details"])
    async def current_due_amount(image: UploadFile) -> MoneyElementResponse:
        return await run_endpoint_query(image, query_due_amount_element)

    @app.post("/credit-details/current-due-date", tags=["credit-details"])
    async def current_due_date(image: UploadFile) -> DateElementResponse:
        return await run_endpoint_query(image, query_due_date_element)
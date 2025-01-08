from fastapi import UploadFile
from data_elements import ElementResponse
from summary_data import list_accounts_query, OverviewResponse, get_query_account_balance, get_query_navigation
from run_endpoint_query import run_endpoint_query


def add_summary_routes(app):

    @app.post("/summary/list-accounts", tags=["summary"])
    async def list_accounts(image: UploadFile) -> OverviewResponse:
        return await run_endpoint_query(image, list_accounts_query)

    @app.post("/login/account-balance-element", tags=["summary"])
    async def account_balance_element(image: UploadFile, account_number: str) -> ElementResponse:
        query = get_query_account_balance(account_number)
        return await run_endpoint_query(image, query)

    @app.post("/login/account-navigate-element", tags=["summary"])
    async def account_navigate_element(image: UploadFile, account_number: str) -> ElementResponse:
        query = get_query_navigation(account_number)
        return await run_endpoint_query(image, query)

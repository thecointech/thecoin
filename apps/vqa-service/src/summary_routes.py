from fastapi import UploadFile
from data_elements import ElementResponse
from summary_data import list_accounts_query, OverviewResponse, get_query_account_balance, get_query_navigation
from run_endpoint_query import Crop, run_endpoint_query
from fastapi import APIRouter

router = APIRouter()

@router.post("/summary/account-balance-element", tags=["summary"])
async def account_balance_element(image: UploadFile, account_number: str, crop: Crop = None) -> ElementResponse:
    query = get_query_account_balance(account_number)
    return await run_endpoint_query(image, query, crop)

@router.post("/summary/list-accounts", tags=["summary"])
async def list_accounts(image: UploadFile) -> OverviewResponse:
    return await run_endpoint_query(image, list_accounts_query)

@router.post("/summary/account-navigate-element", tags=["summary"])
async def account_navigate_element(image: UploadFile, account_number: str, crop: Crop = None) -> ElementResponse:
    query = get_query_navigation(account_number)
    return await run_endpoint_query(image, query, crop)

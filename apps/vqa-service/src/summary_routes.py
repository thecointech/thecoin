from fastapi import UploadFile, Query
from data_elements import ElementResponse, MoneyElementResponse
from summary_data import list_accounts_query, OverviewResponse, get_query_account_balance, get_query_navigation
from run_endpoint_query import Crop, run_endpoint_query
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Annotated

router = APIRouter()

class AccountCrop(BaseModel):
    account_number: str
    crop: Crop|None = None

@router.post("/summary/account-balance-element", tags=["summary"])
async def account_balance_element(
    image: UploadFile,
    account_number: str,
    crop_top: int = None,
    crop_bottom: int = None
) -> MoneyElementResponse:
    crop = None
    if all(x is not None for x in [crop_top, crop_bottom]):
        crop = Crop(top=crop_top, bottom=crop_bottom)
    return await run_endpoint_query(image, get_query_account_balance(account_number), crop)

@router.post("/summary/list-accounts", tags=["summary"])
async def list_accounts(image: UploadFile) -> OverviewResponse:
    return await run_endpoint_query(image, list_accounts_query)

@router.post("/summary/account-navigate-element", tags=["summary"])
async def account_navigate_element(image: UploadFile, account_number: str, crop_top: int = None, crop_bottom: int = None) -> ElementResponse:
    crop = None
    if all(x is not None for x in [crop_top, crop_bottom]):
        crop = Crop(top=crop_top, bottom=crop_bottom)
    query = get_query_navigation(account_number)
    return await run_endpoint_query(image, query, crop)

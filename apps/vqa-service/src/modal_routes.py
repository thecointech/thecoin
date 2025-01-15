from fastapi import UploadFile, APIRouter
from modal_data import *
from data_elements import ElementResponse
from run_endpoint_query import run_endpoint_query

router = APIRouter()

@router.post("/modal-close", tags=["modal"])
async def modal_close(image: UploadFile) -> ElementResponse:
    return await run_endpoint_query(image, query_modal_close)


from fastapi import UploadFile, APIRouter
from run_endpoint_query import run_endpoint_query
from etransfer_data import InputTypeResponse, query_input_type

router = APIRouter()

@router.post("/input-types", tags=["etransfer"])
async def input_types(image: UploadFile) -> InputTypeResponse:
    return await run_endpoint_query(image, query_input_type)

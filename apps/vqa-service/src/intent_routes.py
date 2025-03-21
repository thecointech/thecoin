from fastapi import UploadFile, APIRouter
from run_endpoint_query import run_endpoint_query
from intent_data import IntentResponse, query_page_intent, query_error_message, DetectErrorResponse

router = APIRouter()

@router.post("/page-intent", tags=["intent"])
async def page_intent(image: UploadFile) -> IntentResponse:
    return await run_endpoint_query(image, query_page_intent)


@router.post("/page-error", tags=["intent"])
async def page_error(image: UploadFile) -> DetectErrorResponse:
    return await run_endpoint_query(image, query_error_message)
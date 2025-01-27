
from fastapi import UploadFile, APIRouter
from geo_math import BBox
from input_detection import deduplicate_unique, detect_input_types
from etransfer_data import ConfirmationCodeResponse, InputType, query_confirmation_code
from run_endpoint_query import run_endpoint_query

router = APIRouter()

@router.post("/detect-input-types", tags=["etransfer"])
async def input_types(image: UploadFile, elements: list[object], parent_coords: list[BBox]) -> list[InputType]:

    raw_types = await detect_input_types(
        image, elements, parent_coords
    )

    fixed_types = await deduplicate_unique(
        raw_types, image, elements, parent_coords
    )

    return fixed_types


@router.post("/detect-confirmation-code", tags=["etransfer"])
async def detect_confirmation_code(image: UploadFile) -> ConfirmationCodeResponse:
    return await run_endpoint_query(image, query_confirmation_code)



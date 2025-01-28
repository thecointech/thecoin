
from fastapi import UploadFile, APIRouter
from data_elements import ElementResponse
from geo_math import BBox
from input_detection import deduplicate_unique, detect_input_types
from etransfer_data import ButtonResponse, ETransferLinkResponse, ConfirmationCodeResponse, InputType, get_find_etransfer_link_prompt, query_confirmation_code, query_to_recipient, query_next_button_exists, query_next_button
from query import runQueryToJson
from run_endpoint_query import get_image, run_endpoint_query

router = APIRouter()


@router.post("/best-etransfer-link", tags=["etransfer"])
async def best_etransfer_link(links: list[str]) -> ETransferLinkResponse:
    cleaned_links = [link for link in set([p.replace("\n", " ").strip() for p in links]) if link]

    # Our VQA seems to struggle with long lists
    # segment links into max bucket of size 10
    bucket_size = 10
    while (len(cleaned_links) > 1):
        page_link_groups = [cleaned_links[i:i + bucket_size] for i in range(0, len(cleaned_links), bucket_size)]
        best_links = []
        for page_link_group in page_link_groups:
            result = runQueryToJson(None, get_find_etransfer_link_prompt(page_link_group))
            best_links.append(result['best_link'])

        cleaned_links = best_links

    return ETransferLinkResponse(best_link=cleaned_links[0])


@router.post("/detect-etransfer-form", tags=["etransfer"])
async def detect_etransfer_form(image: UploadFile) -> ETransferLinkResponse:
    pass

@router.post("/detect-input-types", tags=["etransfer"])
async def input_types(image: UploadFile, elements: list[object], parent_coords: list[BBox]) -> list[InputType]:

    (image, _) = await get_image(image)
    raw_types = await detect_input_types(
        image, elements, parent_coords
    )

    fixed_types = await deduplicate_unique(
        raw_types, image, elements, parent_coords
    )

    return fixed_types

@router.post("/detect-to-recipient", tags=["etransfer"])
async def detect_to_recipient(image: UploadFile, recipient: str) -> ElementResponse:
    return await run_endpoint_query(image, query_to_recipient(recipient))


@router.post("/detect-confirmation-code", tags=["etransfer"])
async def detect_confirmation_code(image: UploadFile) -> ConfirmationCodeResponse:
    return await run_endpoint_query(image, query_confirmation_code)

@router.post("/detect-next-button", tags=["etransfer"])
async def detect_next_button(image: UploadFile) -> ButtonResponse|None:
    (image, _)  = await get_image(image)
    exists = await run_endpoint_query(image, query_next_button_exists)
    if (exists.next_button_visible):
        return await run_endpoint_query(image, query_next_button)
    return None



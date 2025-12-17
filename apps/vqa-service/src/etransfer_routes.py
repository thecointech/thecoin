from fastapi import Form, UploadFile, APIRouter
from pydantic import BaseModel
from data_elements import ElementResponse
from geo_math import BBox
from input_detection import deduplicate_unique, detect_input_types
from etransfer_data import ButtonResponse, ETransferCompleteResponse, ETransferFormPresentResponse, ETransferLinkResponse, ConfirmationCodeResponse, ETransferStageResponse, InputType, get_find_etransfer_link_prompt, query_confirmation_code, query_etransfer_complete, query_etransfer_stage, query_to_recipient, query_next_button_exists, query_next_button, query_add_recipient_present
from query import runQueryToJson
from run_endpoint_query import get_image, run_endpoint_query

router = APIRouter()


@router.post("/best-etransfer-link", tags=["etransfer"])
async def best_etransfer_link(links: list[str]) -> ETransferLinkResponse:
    # Remove empty strings/duplicates
    cleaned_links = [link for link in set([p.replace("\n", " ").strip() for p in links]) if link]
    # Running our links through `set` seems to randomize the string order
    # This means we get different sets, thus potentially different
    # results when running the VQA multiple times, which makes testing
    # unstable.  Sort the links to ensure we get the same results every time
    cleaned_links.sort()

    # Our VQA seems to struggle with long lists
    # segment links into max bucket of size 10
    bucket_size = 10
    reasoning = "redacted"
    best_candidates = []
    while (len(cleaned_links) > 1):
        page_link_groups = [cleaned_links[i:i + bucket_size] for i in range(0, len(cleaned_links), bucket_size)]
        best_links = []
        for page_link_group in page_link_groups:
            result = runQueryToJson(None, get_find_etransfer_link_prompt(page_link_group))
            best_links.append(result['best_link'])
            reasoning = result['reasoning']
            best_candidates.append(result['best_link'])
        cleaned_links = best_links

    return ETransferLinkResponse(best_link=cleaned_links[0], reasoning=reasoning, best_candidates=best_candidates)


@router.post("/detect-etransfer-stage", tags=["etransfer"])
async def detect_etransfer_stage(image: UploadFile, title: str) -> ETransferStageResponse:
    return await run_endpoint_query(image, query_etransfer_stage(title))


@router.post("/detect-etransfer-complete", tags=["etransfer"])
async def detect_etransfer_complete(image: UploadFile, title: str) -> ETransferCompleteResponse:
    return await run_endpoint_query(image, query_etransfer_complete(title))


@router.post("/detect-etransfer-form", tags=["etransfer"])
async def detect_etransfer_form(image: UploadFile, title: str) -> ETransferFormPresentResponse:
    # I haven't been able to find any reliable query that finds the form
    # Any vague query turns positive for pretty much any page, and it doesn't
    # seem possible to make a specific query without being too implementation-specific
    # This hack relies on the assumption that every "etransfer" page makes it
    # obvious how to add a new recipient, which will still have false-positives,
    # but seems unlikely to have too many false negatives
    has_button = await run_endpoint_query(image, query_add_recipient_present(title))
    return ETransferFormPresentResponse(form_present=has_button.button_present)


class InputData(BaseModel):
    elements: list[dict]
    parent_coords: list[BBox]

# class InputElements(BaseModel):
#     inputs: list[InputData]

@router.post("/detect-input-types", tags=["etransfer"])
async def input_types(
    image: UploadFile,
    input_elements: str = Form(...)
) -> list[InputType]:

    # Parse the JSON string into our Pydantic model
    input_model = InputData.model_validate_json(input_elements)
    (image, _) = await get_image(image)
    raw_types = await detect_input_types(
        image, input_model.elements, input_model.parent_coords
    )

    fixed_types = await deduplicate_unique(
        raw_types, image, input_model.elements, input_model.parent_coords
    )

    # Convert any "None" types to "other"
    return_types = [t if t is not None else InputType.UNKNOWN for t in fixed_types]
    return return_types

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

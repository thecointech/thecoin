from fastapi import UploadFile
from run_endpoint_query import run_endpoint_query
from data_elements import ElementResponse
from modal_data import query_modal_close


def add_modal_routes(app):

    @app.post("/modal-close", tags=["modal"])
    async def modal_close(image: UploadFile) -> ElementResponse:
        return await run_endpoint_query(image, query_modal_close)

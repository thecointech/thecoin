from fastapi import UploadFile
from run_endpoint_query import run_endpoint_query
from intent_data import IntentResponse, query_page_intent


def add_intent_routes(app):

    @app.post("/page-intent", tags=["intent"])
    async def page_intent(image: UploadFile) -> IntentResponse:
        return await run_endpoint_query(image, query_page_intent)

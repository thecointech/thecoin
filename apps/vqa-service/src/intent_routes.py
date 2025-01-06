

def add_intent_routes(app):

    @app.post("/page-intent")
    async def query_page_intent(image: UploadFile) -> PageType:
        return await run_endpoint_query(image, query_page_intent)

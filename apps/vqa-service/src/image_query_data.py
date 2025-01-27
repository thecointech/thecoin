from pydantic import BaseModel, Field

class ImageQueryResponse(BaseModel):
    result: str = Field(..., description="The generated response to your query about the image")


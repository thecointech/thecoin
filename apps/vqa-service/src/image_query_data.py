from pydantic import BaseModel, Field
from typing import Optional
from fastapi import UploadFile

# from run_endpoint_query import MAX_RESOLUTION, Crop

# class ImageQueryRequest(BaseModel):
#     # image: UploadFile

#     query: str = Field(
#         ...,
#         description="Your question or prompt about the image",
#         example="What objects can you see in this image?",
#         json_schema_extra={"format": "textarea"}
#     )

#     json_description: Optional[str] = Field(
#         None,
#         description="A description of the JSON response",
#         example="Return only valid JSON data in the following format: {{\"description\": \"string\"}}",
#         json_schema_extra={"format": "textarea"}
#     )

#     # crop: Optional[Crop] = Field(
#     #     None,
#     #     description="The crop of the image to use",
#     # )

class ImageQueryResponse(BaseModel):
    result: str = Field(..., description="The generated response to your query about the image")

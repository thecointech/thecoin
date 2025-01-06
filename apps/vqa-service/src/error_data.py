from pydantic import BaseModel, Field

class DetectErrorResponse(BaseModel):
    error_message_detected: bool = Field(..., description="boolean")

class ErrorResponse(BaseModel):
    error_message: str = Field(..., description="The error message")

query_error_message = (
    "Is there an error message on this web page?",
    DetectErrorResponse
)

query_error_text = (
    "What is the error message on this web page?",
    ErrorResponse
)
            
            
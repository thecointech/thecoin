from enum import Enum
from pydantic import BaseModel, Field


# element_schema = {
#     "$schema": "https://json-schema.org/draft/2020-12/schema",
#     "$id": "https://vqa.thecoin.io/element.schema.json",
# 	"type": "object",
#     "properties": {
#         "content": {"type": "string", "description": "Content of the element"},
#         "neighbour_text": {"type": "string", "description": "Text immediately beside or above the element"},
#         "font_color": {"type": "string", "description": "Hexadecimal color of the font", "example": "#FFFFFF"},
#         "background_color": {"type": "string", "description": "Hexadecimal color of the background", "example": "#FFFFFF"},
#         "position_x": {"type": "number" },
#         "position_y": {"type": "number" },
#     },
# }

class ElementResponse(BaseModel):
    content: str = Field(..., description="Content of the element")
    neighbour_text: str = Field(..., description="Text immediately beside or above the element")
    font_color: str = Field(..., description="Hexadecimal color of the font", example="#FFFFFF")
    background_color: str = Field(..., description="Hexadecimal color of the background", example="#FFFFFF")
    position_x: float
    position_y: float

# def get_exists_schema(prop_name="exists", description: str = None):
#     exists_schema = {
#         "$schema": "https://json-schema.org/draft/2020-12/schema",
#         "$id": "https://vqa.thecoin.io/exists.schema.json",
#         "type": "object",
#         "properties": {
#             prop_name: {"type": "boolean" },
#         },
#     }
#     if (description):
#         exists_schema["properties"][prop_name]["description"] = description
#     return exists_schema

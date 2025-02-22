import json
from pydantic import BaseModel, Field
from query import runQueryRaw, runQueryToJson
from PIL import Image
from fastapi import APIRouter

router = APIRouter()

########################
@router.get("/warmup")
def warmup():
    image = Image.new('RGB', (100, 100), (228, 150, 150))
    runQueryRaw(image, "What color is this image?")
    return {"Hello": "World"}

########################
class SimilarityResponse(BaseModel):
    most_similar: str = Field(..., description="the option most similar to the target")
    reasoning: str = Field(..., description="your reasoning")

def query_most_similar(target: str, options: list[str]) -> SimilarityResponse:
    return (
        f"From this list of options: {json.dumps(options)}, which option is the most similar to this target '{target}'?",
        SimilarityResponse
    )
    
@router.post("/detect-most-similar-option")
async def detect_most_similar_option(target: str, options: list[str]) -> SimilarityResponse:
    result = runQueryToJson(None, query_most_similar(target, options))
    return SimilarityResponse(**result)

########################
class CorrectedResponse(BaseModel):
    correct_value: str = Field(..., description="The correct value from source")
    
@router.post("/correct-estimate")
async def correct_estimate(estimate: str, source: str, type: str="text") -> CorrectedResponse:
    r = runQueryToJson(None, (
        f"The estimated {type} \"{estimate}\" is present in the source text: \"{source}\". What is the correct value of the estimated {type}?",
        CorrectedResponse
    ))
    return CorrectedResponse(**r)

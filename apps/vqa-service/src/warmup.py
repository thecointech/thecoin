from query import runQueryRaw
from PIL import Image
from fastapi import APIRouter

router = APIRouter()

@router.get("/warmup")
def warmup():
    image = Image.new('RGB', (100, 100), (228, 150, 150))
    runQueryRaw(image, "What color is this image?")
    return {"Hello": "World"}

import json
from fastapi import APIRouter, HTTPException, UploadFile
from image_query_data import ImageQueryResponse
from query import runQueryRaw, tryConvertToJSON
from run_endpoint_query import MAX_RESOLUTION, Crop, get_image, pixels_to_position, position_to_pixels
from helpers import request_json
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/api/image-query")
async def process_image_query(image: UploadFile, prompt: str, json_description: str=None, crop_top: int=None, crop_height: int=None) -> JSONResponse:
    try:

        crop_top = crop_top or 0
        crop_height = crop_height or MAX_RESOLUTION
        crop = Crop(top=crop_top, bottom=crop_top + crop_height)
        [qimage, crop] = await get_image(image, crop)
        prompt = pixels_to_position(prompt, crop)
        if (json_description):
            prompt = f"{prompt} {request_json} {json_description}"
        response = runQueryRaw(qimage, prompt, 1000)
        if (json_description):
            response = tryConvertToJSON(response)
            position_to_pixels(response, crop)
            return JSONResponse(content=response)
        else:
            return JSONResponse(content=dict(result=response))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/multi-image-query")
async def process_image_query(images: list[UploadFile], prompt: str, json_description: str=None, crop_top: int=None, crop_height: int=None) -> JSONResponse:
    try:
        crop_top = crop_top or 0
        crop_height = crop_height or MAX_RESOLUTION
        crop = Crop(top=crop_top, bottom=crop_top + crop_height)
        [qimage, crop] = await get_image(images[0], crop)
        inputImages = [qimage]
        rest = images[1:]
        for image in rest:
            [qimage, crop] = await get_image(image, crop)
            inputImages.append(qimage)
            
        if (json_description):
            prompt = f"{prompt} {request_json} {json_description}"
        response = runQueryRaw(inputImages, prompt)
        if (json_description):
            response = tryConvertToJSON(response)
            position_to_pixels(response, crop)
            return JSONResponse(content=response)
        else:
            return JSONResponse(content=dict(result=response))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/text-query")
async def process_text_query(prompt: str) -> ImageQueryResponse:
    try:
        return ImageQueryResponse(result=runQueryRaw(None, prompt))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

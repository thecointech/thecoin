from fastapi import APIRouter, HTTPException, UploadFile
from image_query_data import ImageQueryResponse, draw_points, get_points
from query import runQueryRaw, tryConvertToJSON
from run_endpoint_query import MAX_RESOLUTION, BBox, get_image, pixels_to_position, position_to_pixels
from helpers import request_json
from fastapi.responses import JSONResponse, Response
import io

router = APIRouter()


@router.post("/api/image-query")
async def process_image_query(image: UploadFile, prompt: str, json_description: str=None, crop_top: int=None, crop_height: int=None) -> JSONResponse:
    try:

        crop_top = crop_top or 0
        crop_height = crop_height or MAX_RESOLUTION
        crop = BBox(top=crop_top, bottom=crop_top + crop_height)
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
async def process_multi_image_query(images: list[UploadFile], prompt: str, json_description: str=None, crop_top: int=None, crop_height: int=None) -> JSONResponse:
    try:
        crop_top = crop_top or 0
        crop_height = crop_height or MAX_RESOLUTION
        crop = BBox(top=crop_top, bottom=crop_top + crop_height)
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

point_fill = (255, 0, 0, 255)
@router.post("/api/point-image-query", response_class=Response, responses={
    200: {
        "content": {"image/png": {}},
        "description": "Returns the annotated image with points"
    }
})
async def process_point_image_query(image: UploadFile, prompt: str, point_size: int=5, crop_top: int=None, crop_bottom: int=None, crop_left: int=None, crop_right: int=None):
    try:
        crop_top = crop_top or 0
        crop_left = crop_left or 0
        crop_right = crop_right or MAX_RESOLUTION
        crop_bottom = crop_bottom or MAX_RESOLUTION
        crop = BBox(top=crop_top, bottom=crop_bottom, left=crop_left, right=crop_right)

        [qimage, crop] = await get_image(image, crop)
        response = runQueryRaw(qimage, prompt)
        points = get_points(qimage, response)
        global point_fill
        annotated = draw_points(qimage, points, point_fill, point_size)
        annotated.show()
        
        # Convert PIL Image to bytes
        img_byte_arr = io.BytesIO()
        annotated.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        return Response(content=img_byte_arr, media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/text-query")
async def process_text_query(prompt: str) -> ImageQueryResponse:
    try:
        return ImageQueryResponse(result=runQueryRaw(None, prompt))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import os
from fastapi import FastAPI, Security, HTTPException, Depends
from fastapi.security.api_key import APIKeyHeader
from common_routes import router as common_router
from landing_routes import router as landing_router
from intent_routes import router as intent_router
from login_routes import router as login_router
from twofa_routes import router as twofa_router
from summary_routes import router as summary_router
from credit_details_routes import router as credit_details_router
from modal_routes import router as modal_router
from etransfer_routes import router as etransfer_router
from image_query_routes import router as image_query_router
from port import get_version, get_port
from fastapi_tweak import use_route_names_as_operation_ids
from starlette.status import HTTP_403_FORBIDDEN
from starlette.middleware.base import BaseHTTPMiddleware
from monitoring import ResourceMonitoringMiddleware

class KeepAliveMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['Connection'] = 'keep-alive'
        response.headers['Keep-Alive'] = 'timeout=60'
        return response

# API key authentication
API_KEY = os.getenv('API_ACCESS_KEY', None)
api_key_header = None
dependencies = []

if API_KEY is not None:
    api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

    async def get_api_key(api_key_header: str = Security(api_key_header)):
        if api_key_header != API_KEY:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, detail="Invalid API key"
            )
        return api_key_header
    
    dependencies = [Depends(get_api_key)]

app = FastAPI(
    title="Harvester VQA Service API",
    version=get_version(),
    port=get_port(),
    dependencies=dependencies
)

# Setup monitoring middleware
# Add resource monitoring to a FastAPI app
app.add_middleware(ResourceMonitoringMiddleware)
# Add the keep-alive middleware
app.add_middleware(KeepAliveMiddleware)

# Add all routers
app.include_router(common_router)
app.include_router(landing_router)
app.include_router(intent_router)
app.include_router(login_router)
app.include_router(twofa_router)
app.include_router(summary_router)
app.include_router(credit_details_router)
app.include_router(modal_router)
app.include_router(etransfer_router)

app.include_router(image_query_router)

# Tweak operation IDs
use_route_names_as_operation_ids(app)

from fastapi import FastAPI
from warmup import router as warmup_router
from landing_routes import router as landing_router
from intent_routes import router as intent_router
from login_routes import router as login_router
from twofa_routes import router as twofa_router
from summary_routes import router as summary_router
from credit_details_routes import router as credit_details_router
from modal_routes import router as modal_router
from image_query_routes import router as image_query_router
from port import get_version, get_port
from fastapi_tweak import use_route_names_as_operation_ids

from starlette.middleware.base import BaseHTTPMiddleware
class KeepAliveMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['Connection'] = 'keep-alive'
        response.headers['Keep-Alive'] = 'timeout=60'
        return response

app = FastAPI(
    title="Harvester VQA Service API",
    version=get_version(),
    port=get_port(),
)

app.add_middleware(KeepAliveMiddleware)

# Add all routers
app.include_router(warmup_router)
app.include_router(landing_router)
app.include_router(intent_router)
app.include_router(login_router)
app.include_router(twofa_router)
app.include_router(summary_router)
app.include_router(credit_details_router)
app.include_router(modal_router)

app.include_router(image_query_router)

# Tweak operation IDs
use_route_names_as_operation_ids(app)

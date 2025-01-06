from fastapi import FastAPI
from landing_routes import add_landing_routes
from intent_routes import add_intent_routes
from login_routes import add_login_routes
from modal_routes import add_modal_routes
from singleton import get_model
from port import get_version, get_port
from fastapi_tweak import use_route_names_as_operation_ids

app = FastAPI(
    title="Harvester VQA Service API",
    version=get_version(),
    port=get_port(),
)


@app.get("/warmup")
def warmup():
    # runQuery("", "")
    get_model()
    return {"Hello": "World"}


add_intent_routes(app)
add_landing_routes(app)
add_login_routes(app)
add_modal_routes(app)

use_route_names_as_operation_ids(app)

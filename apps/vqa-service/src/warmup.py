from query import runQueryRaw
from PIL import Image


def add_warmup_routes(app):
    @app.get("/warmup")
    def warmup():
        image = Image.new('RGB', (100, 100), (228, 150, 150))
        runQueryRaw("What color is this image?", image)
        return {"Hello": "World"}
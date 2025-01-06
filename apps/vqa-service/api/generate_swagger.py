import json
import os
import sys
from fastapi.openapi.utils import get_openapi

# Add the src directory to the Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from main import app

if __name__ == '__main__':

    schema = get_openapi(
        title="VQA Service API",
        version="1.0.0",
        description="A simple API for Visual Question Answering",
        routes=app.routes
    )

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

    # Save to file in the api directory
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'swagger.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(schema, f, indent=2)

    print(f"Swagger specification has been saved to '{output_file}'")

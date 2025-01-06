from PIL import Image
from flask_restx import Resource, fields
from query import runQuery
from helpers import get_instruct_json_respose
from data_landing import query_cookie_exists, cookie_exists_schema, element_schema
import io
import werkzeug

# query_cookie_exists = f"Analyze the provided screenshot of a webpage. Determine if a cookie banner is present. The cookie banner must contain a button that includes the word \"Accept\". {get_instruct_json_respose(cookie_exists_schema)}"
# query_cookie_accept = f"Analyze the provided webpage. Describe the button to accept cookies and continue. {get_instruct_json_respose(element_schema)}"
# query_navigate_to_login = f"In the provided webpage, describe the element that will navigate to the login page.  {get_instruct_json_respose(element_schema)}"


def add_endpoint(ns, api, name, query, schema):

    # Register the schema with Swagger
    element_response_model = api.schema_model(f"{name}-response", schema)
    # Element query parser
    element_parser = api.parser()
    element_parser.add_argument('image',
                                type=werkzeug.datastructures.FileStorage,
                                location='files',
                                required=True,
                                help='Image file to analyze')

    @ns.expect(element_parser)
    @ns.response(200, 'Success', element_response_model)
    @ns.response(400, 'Validation Error')
    def callback():
        """Submit an image to search for a specific UI element"""
        args = element_parser.parse_args()
        image_file = args['image']

        # Validate file type
        if not image_file.filename or '.' not in image_file.filename:
            api.abort(400, 'Invalid file format')

        try:
            # Read and validate image
            image_bytes = image_file.read()
            image = Image.open(io.BytesIO(image_bytes))

            prompt = f"{query} {get_instruct_json_respose(schema)} "

            # Construct prompt based on element type and details
            response = runQuery(
                prompt=prompt,
                image=image,
            )

            return response

        except Exception as e:
            api.abort(400, str(e))

    ns.add_url_rule(f'/{name}', endpoint=name, view_func=callback, methods=['POST'])

def add_landing_endpoints(ns, api):

    add_endpoint(ns, api, 'query-cookie-exists', query_cookie_exists, cookie_exists_schema)

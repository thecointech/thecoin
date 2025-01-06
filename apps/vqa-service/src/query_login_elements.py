
import io
from flask_restx import Resource
import werkzeug
from helpers import cast_value, get_instruct_json_respose
from data_elements import element_schema, ElementType
from query import runQuery
from PIL import Image

pwd_input_schema = {
	"type": "object",
    "properties": {
        "password_input_detected": {
            "type": "boolean",
        },
    },
}

error_message_schema = {
    "type": "object",
    "properties": {
        "error_message_detected": {
            "type": "boolean",
        },
        "error_message": {
            "type": "string",
            "description": "Optionally contains error message only if error_message_detected is true"
        },
    },
}

query_username_element = f"Analyze the provided webpage. Describe the input for the username or cardnumber. {get_instruct_json_respose(element_schema)}"
query_password_element = f"Describe the password text input in this webpage. {get_instruct_json_respose(element_schema)}"
query_pwd_exists = f"Is there a password input? {get_instruct_json_respose(pwd_input_schema)}"
query_continue_button = f"Analyze the provided webpage. Describe the element to proceed to the next step. {get_instruct_json_respose(element_schema)}"
query_login_button = f"Describe the button to complete login on this webpage. It should be near the username and password inputs.  {get_instruct_json_respose(element_schema)}"
query_error_message = f"Analyze the provided webpage. If an error message that is preventing login is present, describe it. {get_instruct_json_respose(error_message_schema)}"


def setup_query_element(ns, api):

    # Register the schema with Swagger
    element_response_model = api.schema_model('ElementResponse', element_schema)

    # Element query parser
    element_parser = api.parser()
    element_parser.add_argument('image',
                                type=werkzeug.datastructures.FileStorage,
                                location='files',
                                required=True,
                                help='Image file to analyze')
    element_parser.add_argument('elementType',
                                type=str,
                                required=True,
                                choices=[e.value for e in ElementType],
                                help='Type of element to search for')
    element_parser.add_argument('details',
                                type=str,
                                required=False,
                                help='Additional details for the search (e.g., button text)')

    @ns.route('/query-element')
    class QueryLoginElement(Resource):
        @ns.expect(element_parser)
        @ns.response(200, 'Success', element_response_model)
        @ns.response(400, 'Validation Error')
        def post(self):
            """Submit an image to search for a specific UI element"""
            args = element_parser.parse_args()
            image_file = args['image']
            element_type = args['elementType']
            details = args.get('details', '')

            # Validate file type
            if not image_file.filename or '.' not in image_file.filename:
                api.abort(400, 'Invalid file format')

            try:
                # Read and validate image
                image_bytes = image_file.read()
                image = Image.open(io.BytesIO(image_bytes))

                # Construct prompt based on element type and details
                prompt = f"Find the {element_type.lower()}"
                if details:
                    if element_type == ElementType.BUTTON:
                        prompt += f" with text '{details}'"
                    elif element_type == ElementType.INPUT:
                        prompt += f" for {details}"
                    elif element_type == ElementType.TEXT:
                        prompt += f" containing '{details}'"

                if (element_type == ElementType.CLOSE_MODAL):
                    prompt = f"In the provided webpage, describe the element that will close the modal dialog without permanent side-effects.  {get_instruct_json_respose(element_schema)}"

                response = runQuery(
                    prompt=prompt,
                    image=image,
                )

                print("Response: " + str(response))

                cast_value(response, "position_x", image.width)
                cast_value(response, "position_y", image.height)

                return response

            except Exception as e:
                api.abort(400, str(e))

    return QueryLoginElement

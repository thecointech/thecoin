from flask import Flask, request
from flask_restx import Api, Resource, fields
from PIL import Image
from port import get_port, get_version
import io
import werkzeug
from enum import Enum
from molmo import runQuery
import json

app = Flask(__name__)
api = Api(app,
    version=get_version(),
    title='VQA Service API',
    description='A simple API for Visual Question Answering',
    default='vqa',
    default_label='VQA Operations',
    doc='/docs',
)

# Define namespace
ns = api.namespace('vqa', description='VQA operations')

class PageType(str, Enum):
    LANDING = 'Landing'
    LOGIN = 'Login'
    ACCOUNT_SELECT = 'AccountSelect'
    ACCOUNT_DETAILS = 'AccountDetails'
    PAY_BILL = 'PayBill'
    SEND_TRANSFER = 'SendTransfer'
    # Other kinds of pages
    MODAL_DIALOG = 'ModalDialog'
    ERROR_MESSAGE = 'ErrorMessage'

class ElementType(str, Enum):
    CLOSE_MODAL = 'CloseModal'
    BUTTON = 'Button'
    INPUT = 'Input'
    TEXT = 'Text'

# Define models for Swagger documentation
page_response_model = api.model('PageResponse', {
    'type': fields.String(required=True,
                         description='Type of the page',
                         enum=[e.value for e in PageType],
                         example="option")
})

element_response_model = api.model('ElementResponse', {
    'content': fields.String(required=False, description='Content of the element', example='text'),
    'font_color': fields.String(required=False, description='Font color of the element', example='#color'),
    'background_color': fields.String(required=False, description='Background color of the element', example='#color'),
    'neighbour_text': fields.String(required=False, description='Neighbour text of the element', example='text'),
    'position_x': fields.Float(required=False, description='X-position of the element in percent', example='number'),
    'position_y': fields.Float(required=False, description='Y-position of the element in percent', example='number'),
    # 'width': fields.Float(required=False, description='Width of the element in percent', example='number'),
    # 'height': fields.Float(required=False, description='Height of the element in percent', example='number')
})

# File upload parser
upload_parser = api.parser()
upload_parser.add_argument('image',
                         type=werkzeug.datastructures.FileStorage,
                         location='files',
                         required=True,
                         help='Image file to analyze')

# Element query parser
element_parser = upload_parser.copy()
element_parser.add_argument('elementType',
                          type=str,
                          required=True,
                          choices=[e.value for e in ElementType],
                          help='Type of element to search for')
element_parser.add_argument('details',
                          type=str,
                          required=False,
                          help='Additional details for the search (e.g., button text)')


def get_model_example(model):
    """
    Extracts example data from a Flask-RESTX Model.
    """
    example = {}
    for field_name, field_obj in model.items():
        if hasattr(field_obj, 'example'):
            example[field_name] = field_obj.example
    # Convert to valid JSON
    return json.dumps(example)

@ns.route('/query-page-intent')
class QueryPageIntent(Resource):
    @ns.expect(upload_parser)
    @ns.response(200, 'Success', page_response_model)
    @ns.response(400, 'Validation Error')
    def post(self):
        """Submit an image for page intent analysis"""
        args = upload_parser.parse_args()
        image_file = args['image']

        # Validate file type
        if not image_file.filename or '.' not in image_file.filename:
            api.abort(400, 'Invalid file format')

        try:
            # Read and validate image
            image_bytes = image_file.read()
            image = Image.open(io.BytesIO(image_bytes))

            typesStr = ", ".join([e.value for e in PageType])
            response = runQuery(
              prompt=f"From the following options, select the one that best describes the given webpage: {typesStr}. Return only valid JSON data in the following format: {get_model_example(page_response_model)}",
              image=image
            )

            # validate response matches expected format
            if 'type' not in response or response['type'] not in [e.value for e in PageType]:
                api.abort(500, 'Internal Error: Invalid response format')

            return response

        except Exception as e:
            api.abort(400, str(e))

@ns.route('/query-element')
class QueryElement(Resource):
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
              prompt = f"In the provided webpage, describe the element that will close the modal dialog without permanent side-effects.  Return only valid JSON data in the following format: {get_model_example(element_response_model)}"

            response = runQuery(
                prompt=prompt,
                image=image,
            )

            print("Response: " + str(response))

            def cast_value(response, key, scale):
              if key in response:
                try:
                  response[key] = round(scale * float(response[key]) / 100)
                except ValueError:
                  print("Invalid value for " + key + ": " + response[key])
                  response[key] = None

            cast_value(response, "position_x", image.width)
            cast_value(response, "position_y", image.height)
            # cast_value(response, "width", image.width)
            # cast_value(response, "height", image.height)

            return response

        except Exception as e:
            api.abort(400, str(e))

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=get_port(), debug=True)

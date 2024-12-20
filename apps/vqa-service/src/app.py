from flask import Flask, request
from flask_restx import Api, Resource, fields
from PIL import Image
import io
import werkzeug
from enum import Enum
from molmo import runQuery

app = Flask(__name__)
api = Api(app, version='1.0', title='VQA Service API',
          description='A simple API for Visual Question Answering')

# Define namespace
ns = api.namespace('api', description='VQA operations')

class PageType(str, Enum):
    FRONT = 'Front'
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
                         example=PageType.FRONT.value)
})

element_response_model = api.model('ElementResponse', {
    'content': fields.String(required=False, description='Content of the element', example='text'),
    'font_color': fields.String(required=False, description='Font color of the element', example='#color'),
    'background_color': fields.String(required=False, description='Background color of the element', example='#color'),
    'neighbour_text': fields.String(required=False, description='Neighbour text of the element', example='text'),
    'position_x': fields.Float(required=False, description='X-position of the element in percent', example='number'),
    'position_y': fields.Float(required=False, description='Y-position of the element in percent', example='number')
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
    return example

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

            response = runQuery(
              prompt="From the following options, select the one that best describes the given webpage: " + ", ".join([e.value for e in PageType]) + ". Return the data in the following JSON format: { 'type': 'option' }",
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
              prompt = f"In the provided webpage, describe the element that will close the modal dialog without permanent side-effects.  Include neighbouring text immediately above or beside the element. Return only JSON data in the following format: {get_model_example(element_response_model)}"

            response = runQuery(
                prompt=prompt,
                image=image,
            )

            return response

        except Exception as e:
            api.abort(400, str(e))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

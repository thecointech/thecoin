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

# Define models for Swagger documentation
response_model = api.model('Response', {
    'type': fields.String(required=True,
                         description='Type of the page',
                         enum=[e.value for e in PageType],
                         example=PageType.FRONT.value)
})

# File upload parser
upload_parser = api.parser()
upload_parser.add_argument('image',
                         type=werkzeug.datastructures.FileStorage,
                         location='files',
                         required=True,
                         help='Image file to analyze')

@ns.route('/query-page-intent')
class QueryPageIntent(Resource):
    @ns.expect(upload_parser)
    @ns.response(200, 'Success', response_model)
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

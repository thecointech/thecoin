from flask_restx import Resource, fields
from PIL import Image
import io
from enum import Enum
from molmo import runQuery
from helpers import get_model_example
import werkzeug


class PageType(str, Enum):
    LANDING = 'Landing'
    LOGIN = 'Login'
    ACCOUNT_SELECT = 'AccountSelect'
    ACCOUNT_DETAILS = 'AccountDetails'
    PAY_BILL = 'PayBill'
    SEND_TRANSFER = 'SendTransfer'
    MODAL_DIALOG = 'ModalDialog'
    ERROR_MESSAGE = 'ErrorMessage'


def setup_query_page_intent(ns, api):

    upload_parser = api.parser()
    upload_parser.add_argument('image',
                               type=werkzeug.datastructures.FileStorage,
                               location='files',
                               required=True,
                               help='Image file to analyze')

    # Define models for Swagger documentation
    page_response_model = api.model('PageResponse', {
        'type': fields.String(required=True,
                              description='Type of the page',
                              enum=[e.value for e in PageType],
                              example="option")
    })

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

    return QueryPageIntent

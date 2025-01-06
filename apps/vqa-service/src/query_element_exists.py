from PIL import Image
from flask_restx import Resource, fields
from query import runQuery
from helpers import get_instruct_json_respose
from data_element import ElementType, element_schema
import io
import werkzeug


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

    @ns.route('/query-element-exists')
    class QueryElementExists(Resource):
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


                if (element_type == ElementType.CLOSE_MODAL):
                    prompt = f"In the provided webpage, describe the element that will close the modal dialog without permanent side-effects.  {get_instruct_json_respose(element_schema)}"

                response = runQuery(
                    prompt=prompt,
                    image=image,
                )

                print("Response: " + str(response))

                def cast_value(response, key, scale):
                    if key in response:
                        try:
                            response[key] = round(
                                scale * float(response[key]) / 100)
                        except ValueError:
                            print("Invalid value for " +
                                  key + ": " + response[key])
                            response[key] = None

                cast_value(response, "position_x", image.width)
                cast_value(response, "position_y", image.height)
                # cast_value(response, "width", image.width)
                # cast_value(response, "height", image.height)

                return response

            except Exception as e:
                api.abort(400, str(e))

    return QueryElementExists

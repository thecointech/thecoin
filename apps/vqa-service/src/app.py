from flask import Flask
from flask_restx import Api
from port import get_port, get_version
from query_page_intent import setup_query_page_intent
from query_element import setup_query_element
from query_landing import add_landing_endpoints

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

# Set up the QueryPageIntent endpoint
setup_query_page_intent(ns, api)
setup_query_element(ns, api)
add_landing_endpoints(ns, api)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=get_port(), debug=True)

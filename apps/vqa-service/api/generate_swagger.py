import json
import os
import sys

# Add the src directory to the Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))


if __name__ == '__main__':
    # Configure the application
    app.config.update({
        'SERVER_NAME': 'localhost:{}'.format(get_port()),
        'APPLICATION_ROOT': '/',
        'PREFERRED_URL_SCHEME': 'http'
    })

    with app.app_context():
        # Get the Swagger/OpenAPI specification as a dictionary
        swagger_dict = api.__schema__

        # Ensure the output directory exists
        os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

        # Save to file in the api directory
        output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'swagger.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(swagger_dict, f, indent=2)

        print(f"Swagger specification has been saved to '{output_file}'")

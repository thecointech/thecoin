import json
from app import api, app

if __name__ == '__main__':
    # Configure the application
    app.config.update({
        'SERVER_NAME': 'localhost:5000',
        'APPLICATION_ROOT': '/',
        'PREFERRED_URL_SCHEME': 'http'
    })

    with app.app_context():
        # Get the Swagger/OpenAPI specification as a dictionary
        swagger_dict = api.__schema__
        
        # Save to file
        with open('swagger.json', 'w', encoding='utf-8') as f:
            json.dump(swagger_dict, f, indent=2, ensure_ascii=False)
        
        print("Swagger specification has been saved to 'swagger.json'")

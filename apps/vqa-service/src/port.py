import os
import json

def get_port():
    """Get the port number from environment variables"""
    return int(os.environ.get('PORT', os.environ.get('PORT_SERVICE_VQA', 7004)))

def get_version():
    """Get the version from package.json"""
    try:
        package_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'package.json')
        with open(package_path) as f:
            package = json.load(f)
            return package.get('version', '1.0.0')
    except Exception:
        return '1.0.0'

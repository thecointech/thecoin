import json

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

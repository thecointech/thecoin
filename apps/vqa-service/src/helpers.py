import json

request_json = "Return only JSON in the following format: "

def get_model_example(schema):
    """
    Extracts example data from a JSON schema
    """
    example = {}
    for field_name, field_obj in schema["properties"].items():
        if "example" in field_obj:
            example[field_name] = field_obj["example"]
        elif "description" in field_obj:
            example[field_name] = field_obj["description"]
        else:
            example[field_name] = field_obj["type"]
    # Convert to valid JSON
    return json.dumps(example)

def get_instruct_json_respose(schema):
    return request_json + get_model_example(schema)

def cast_value(response, key, scale):
    if key in response:
        try:
            response[key] = round(scale * float(response[key]) / 100)
        except ValueError:
            print(f"Invalid value for {key}: {response[key]}")
            response[key] = None

        return response[key]

    return None


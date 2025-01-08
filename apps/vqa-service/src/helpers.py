import json

request_json = "Return only JSON in the following format: "

def get_sub_schema(definitions: dict, path: str):
    type_name = path.split("/")[-1]
    return definitions[type_name]

def get_model_value(field_obj, defs):
    if "example" in field_obj:
        return field_obj["example"]
    elif "description" in field_obj:
        return field_obj["description"]
    elif "type" in field_obj and field_obj["type"] == "array":
        return [get_model_value(field_obj["items"], defs)]
    elif "$ref" in field_obj:
            path = field_obj["$ref"]
            subschema = get_sub_schema(defs, path)
            if ('enum' in subschema):
                return '|'.join(subschema['enum'])
            elif ('properties' in subschema):
                return get_model_example_json(subschema, defs)
            # default, we don't know what to do
            raise ValueError(f"Invalid $ref: {path}")

    return field_obj["type"]


def get_model_example_json(schema, defs):
    example = {}
    for item in schema["properties"].items():
        field_name, field_obj = item
        example[field_name] = get_model_value(field_obj, defs)
        # if "example" in field_obj:
        #     example[field_name] = field_obj["example"]
        # elif "description" in field_obj:
        #     example[field_name] = field_obj["description"]
        # elif "type" in field_obj and field_obj["type"] == "array":
        #     if "$ref" in field_obj["items"]:
        #         path = field_obj["items"]["$ref"]
        #         subschema = get_sub_schema(schema, path)
        #         example[field_name] = [get_model_example_json(subschema)]
        #     elif "description" in field_obj:
        #         example[field_name] = [field_obj["description"]]
        # else:
        #     example[field_name] = field_obj["type"]

    return example

def get_model_example(schema):
    """
    Extracts example data from a JSON schema
    """
    defs = schema.get("$defs", {})
    example = get_model_example_json(schema, defs)
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

    # search recursively through the object
    if isinstance(response, dict):
        for k, v in response.items():
            if isinstance(v, dict):
                cast_value(v, key, scale)
            elif (isinstance(v, list)):
                for item in v:
                    cast_value(item, key, scale)

    return None


from PIL.Image import Image
import torch
from transformers import GenerationConfig
import json
import re
from timeit import default_timer as timer
from singleton import get_model, get_processor, device_map
from helpers import get_instruct_json_respose
from logger import setup_logger

logger = setup_logger(__name__)

def runQueryRaw(image, prompt, max_length=200) -> str:
    start = timer()

    processor = get_processor()
    model = get_model()

    print(f"Running Prompt: {prompt}")

    try:
        images = image if isinstance(image, list) else [image] if image is not None else None
        # process the image and text
        inputs = processor.process(
            images=images,
            text=prompt,
        )

        # move inputs to the correct device and make a batch of size 1
        inputs = {k: v.to(model.device).unsqueeze(0) for k, v in inputs.items()}

        if image is not None:
            inputs["images"] = inputs["images"].to(torch.bfloat16)

        with torch.autocast(device_type=device_map, enabled=True, dtype=torch.bfloat16):
            output = model.generate_from_batch(
                inputs,
                GenerationConfig(max_new_tokens=max_length, stop_strings="<|endoftext|>"),
                tokenizer=processor.tokenizer
            )

        # generate output; maximum 200 new tokens
        # output = model.generate_from_batch(
        #     inputs,
        #     GenerationConfig(max_new_tokens=max_length, stop_strings="<|endoftext|>"),
        #     tokenizer=processor.tokenizer,
        # )

        # only get generated tokens; decode them to text
        generated_tokens = output[0, inputs["input_ids"].size(1):]
        generated_text = processor.tokenizer.decode(
            generated_tokens, skip_special_tokens=True
        )
        return generated_text

    except Exception as e:
        print(f"Error in runQuery: {str(e)}")
        raise

    finally:
        end = timer()
        print(f"Query took {end - start} seconds")


def runQueryToJson(image: Image, query_data: tuple[str, type], max_length=200):
    prompt = f"{query_data[0]} {get_instruct_json_respose(query_data[1].schema())}"

    response = runQueryRaw(image, prompt, max_length)

    return tryConvertToJSON(response)

def tryConvertToJSON(response):
    # Parse the generated text as JSON

    # First, try and work through the weird bug that injects "!"
    # characters throughout the response.
    # if (torch.__version__.startswith("2.6.0+rocm6.4.1")):
    #     response = re.sub(r'\"\!([a-zA-Z0-9_]+)\":', '"\\1":', response)
    # else:
    #     logger.warning("UNTESTED TORCH VERSION: " + torch.__version__ + " - not filtering tokens")

    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        # print("Raw Raised JSONDecodeError: ", e)
        # we sometimes get the following invalid json output "option":="value"
        cleaned = response.replace('":="', '": "')
        # In longer JSON am seeing eg: "position_y="43.5",
        cleaned = re.sub(r'=\"([\d\.]+)\"', r'": \g<1>', cleaned)
        # The model has trouble when returning None options
        # eg: {'error_message_detected': False, 'error_message': None}
        cleaned = re.sub(r",?\s*['\"][^'\"]+['\"]: None", '', cleaned, flags=re.IGNORECASE)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            print("Cleaned Raised JSONDecodeError: ", e)
            # If the model didn't return valid JSON, try to extract the type

            # Try finding everything in between brackets
            match = re.search(r"(\{[\w\W]*\})", cleaned)
            if match:
                return json.loads(match.group(1))
            print("Could not parse model output as JSON: ", response)
            raise ValueError("Could not parse model output as JSON")


if __name__ == "__main__":
    import sys
    import PIL.Image

    image = PIL.Image.open(sys.argv[1])
    response = runQueryRaw(image, sys.argv[2])
    print(json.dumps(response))

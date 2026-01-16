from PIL.Image import Image
import torch
from transformers import GenerationConfig
import json
import re
from timeit import default_timer as timer
from query_json_fix import clean_invalid_json_chars, extract_json_text, fix_unescaped_quotes
from singleton import get_model, get_processor, device_map
from helpers import get_instruct_json_respose
from logger import setup_logger

logger = setup_logger(__name__)

def runQueryRaw(image: Image|None, prompt: str, max_length=200) -> str:
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


def runQueryToJson(image: Image|None, query_data: tuple[str, type], max_length=200):
    prompt = f"{query_data[0]} {get_instruct_json_respose(query_data[1].schema())}"

    response = runQueryRaw(image, prompt, max_length)

    return tryConvertToJSON(response)


def tryConvertToJSON(response):
    # Parse the generated text as JSON, applying various fixes if needed

    try:
        return json.loads(response)
    except json.JSONDecodeError as e:

        # Try fixing unescaped quotes first
        fixed_quotes = fix_unescaped_quotes(response)
        try:
            return json.loads(fixed_quotes)
        except json.JSONDecodeError:
            pass  # Continue to other fixes

        cleaned = clean_invalid_json_chars(response)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            pass  # Continue to other fixes

        extracted = extract_json_text(cleaned)
        try:
            return json.loads(extracted)
        except json.JSONDecodeError as e:
            pass  # No more fixes...

        print("Could not parse model output as JSON: ", response)
        raise ValueError("Could not parse model output as JSON")


if __name__ == "__main__":
    import sys
    import PIL.Image

    image = PIL.Image.open(sys.argv[1])
    response = runQueryRaw(image, sys.argv[2])
    print(json.dumps(response))

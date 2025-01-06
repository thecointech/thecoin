import torch
from transformers import GenerationConfig
import json
from timeit import default_timer as timer
from singleton import get_model, get_processor
from helpers import cast_value

def runQueryRaw(prompt, image, max_length=200):
    start = timer()

    processor = get_processor()
    model = get_model()

    print(f"Running Prompt: {prompt}")

    try:
        # process the image and text
        inputs = processor.process(
            images=[image],
            text=prompt,
        )

        # move inputs to the correct device and make a batch of size 1
        inputs = {k: v.to(model.device).unsqueeze(0) for k, v in inputs.items()}

        inputs["images"] = inputs["images"].to(torch.bfloat16)
        with torch.autocast(device_type="cuda", enabled=True, dtype=torch.bfloat16):
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


def runQueryToJson(query, image, max_length=200):
    response = runQueryRaw(query, image, max_length)
    # Parse the generated text as JSON
    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        # print("Raw Raised JSONDecodeError: ", e)
        # we sometimes get the following invalid json output "option":="value"
        cleaned = response.replace('":="', '": "')
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            print("Cleaned Raised JSONDecodeError: ", e)
            # If the model didn't return valid JSON, try to extract the type
            import re

            # Try finding everything in between brackets
            match = re.search(r"(\{[\w\W]*\})", cleaned)
            if match:
                return json.loads(match.group(1))
            print("Could not parse model output as JSON: ", response)
            raise ValueError("Could not parse model output as JSON")


def runQuery(query, image, max_length=200): 
    response = runQueryToJson(query, image, max_length)
    cast_value(response, "position_x", image.width)
    cast_value(response, "position_y", image.height)
    return response


if __name__ == "__main__":
    import sys
    import PIL.Image

    image = PIL.Image.open(sys.argv[1])
    response = runQuery(sys.argv[2], image)
    print(json.dumps(response))

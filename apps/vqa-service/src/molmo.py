from transformers import AutoModelForCausalLM, AutoProcessor, GenerationConfig
import json
from timeit import default_timer as timer

# load the processor
processor = AutoProcessor.from_pretrained(
    'allenai/Molmo-7B-D-0924',
    trust_remote_code=True,
    torch_dtype='auto',
    device_map='auto'
)

# load the model
model = AutoModelForCausalLM.from_pretrained(
    'allenai/Molmo-7B-D-0924',
    trust_remote_code=True,
    torch_dtype='auto',
    device_map='auto'
)

def runQuery(prompt, image, max_length=200):
    start = timer()

    print(f"Running Prompt: {prompt}")

    try:
        # process the image and text
        inputs = processor.process(
            images=[image],
            text=prompt,
        )

        # move inputs to the correct device and make a batch of size 1
        inputs = {k: v.to(model.device).unsqueeze(0) for k, v in inputs.items()}

        # generate output; maximum 200 new tokens
        output = model.generate_from_batch(
            inputs,
            GenerationConfig(max_new_tokens=max_length, stop_strings="<|endoftext|>"),
            tokenizer=processor.tokenizer
        )

        # only get generated tokens; decode them to text
        generated_tokens = output[0,inputs['input_ids'].size(1):]
        generated_text = processor.tokenizer.decode(generated_tokens, skip_special_tokens=True)

        # Parse the generated text as JSON
        try:
            return json.loads(generated_text)
        except json.JSONDecodeError as e:
          print("Raised JSONDecodeError: ", e)
          # If the model didn't return valid JSON, try to extract the type
          import re
          match = re.search(r"'type':\s*'([^']*)'", generated_text)
          if match:
              return {'type': match.group(1)}
          print("Could not parse model output as JSON: ", generated_text)
          raise ValueError("Could not parse model output as JSON")

    except Exception as e:
        print(f"Error in runQuery: {str(e)}")
        raise

    finally:
        end = timer()
        print(f"Query took {end - start} seconds")


if (__name__ == "__main__"):
    import sys
    import PIL.Image
    image = PIL.Image.open(sys.argv[1])
    response = runQuery(sys.argv[2], image)
    print(json.dumps(response))

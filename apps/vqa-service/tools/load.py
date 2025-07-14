import os
import sys
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from query import runQueryRaw
from PIL import Image
import requests

#
# Helper file useful for triggering download of model outside of test env
# 
img = Image.open(requests.get("https://picsum.photos/id/237/536/354", stream=True).raw)
r = runQueryRaw(img, "Describe this image.  Return only valid JSON data in the following format: {{\"description\": \"string\"}}") 
print(r)

# do a second run to verify runtime without load
r = runQueryRaw(img, "Describe this image using only words that start with the letter 'R'.  Return only valid JSON data in the following format: {{\"description\": \"string\"}}") 
print(r)

from runQuery import runQuery
from PIL import Image
import requests

#
# Helper file useful for triggering download of model outside of test env
# 
img = Image.open(requests.get("https://picsum.photos/id/237/536/354", stream=True).raw)
runQuery("Describe this image.  Return only valid JSON data in the following format: {{\"description\": \"string\"}}", img) 
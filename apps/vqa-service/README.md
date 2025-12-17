# VQA Service

A simple Flask-based web API for Visual Question Answering (VQA) tasks.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

Start the server:
```bash
python app.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### POST /query-page-intent

Accepts an image file and returns page intent analysis.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - image: (file) The image to analyze

**Response:**
```json
{
    "page_type": "form",
    "confidence": 0.95,
    "elements": [
        {
            "type": "input_field",
            "position": [100, 200]
        },
        {
            "type": "button",
            "position": [300, 400]
        }
    ]
}
```

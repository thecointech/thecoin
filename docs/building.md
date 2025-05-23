## MacOS

Make sure node-gyp is setup correctly, etc
Remove ngrok from site-app (if it's still there)
Delete node_modules/dtrace-provider

Maybe configure a maker: https://www.electronforge.io/config/makers/dmg

## Linux
 * Note, this should be pretty much the same as the steps in the GitHub Actions build script

- clone
- install the right version of NodeJS
- run `corepack enable`

(post-install builds)
- sqlite3 
`sudo apt install python3-setuptools`

- node-hid (this could maybe be removed on update of the npm package)
`apt install build-essential pkg-config`
`apt install libudev-dev`
`apt install libusb-1.0-0 libusb-1.0-0-dev`

- Install Java for openapi `sudo apt install default-jre`

For production builds, secrets need to be enabled:
- Set THECOIN_SECRETS environment variable to point to the bitwarden key file
- (Optional) Set THECOIN_DATA environment variable to point to the data folder


### VQA Service

- (AMD) Install ROCm `https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html`
- Create a venv for VQA `python3 -m venv .venv`
- Activate the venv `source .venv/bin/activate`
- Install ROCm dependencies `pip install -r requirements.remote.txt`
- (AMD) Install dependencies `pip install -r requirements.txt`

The model needs to be explicitly downloaded before running.  This can be done with the `update_model.py` script in the tools folder.
- Create a new access token from huggingface: https://huggingface.co/settings/tokens
  - Select "read" permissions only
  - Copy the token
- Login to huggingface: `huggingface-cli login`
  - Do not set token as Github token
- Run `python3 tools/update_model.py`

(NOTE: Maybe we should have a download-only script, vs a full update version)



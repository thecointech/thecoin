## All

- clone
- install the right version of NodeJS (currently v24)
- run `corepack enable`

- *NOTE* To build [production](./environments.md) builds requires [secrets](./secrets.md) to be present.  Development & devlive require no external info.

## Windows

Assuming a fresh machine
 - Install required packages
  - Install VC++ Redist `winget install --id Microsoft.VCRedist.2015+.x64 -e`
  - Install Python `winget install --id Python.Python.3.12 -e`
  - Install Build Tools: `winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`
  - Install Java JRE (used by build:apis) `winget install --id Azul.Zulu.17.JRE -e`
 - Enable SymLinks, by either (used by go-ipfs):
    - Turn developer mode on (recommended)
      - WinKey, "Settings", search for "Use developer features", turn on "Developer Mode"
    - Always run `yarn` from an elevated prompt
 - Reboot machine `Restart-Computer`
 - `yarn install && yarn build`

## MacOS

Make sure node-gyp is setup correctly, etc
Remove ngrok from site-app (if it's still there)
Delete node_modules/dtrace-provider

## Linux
 * Note, this should be pretty much the same as the steps in the GitHub Actions build script

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

- (AMD) Install ROCm `https://rocm.docs.amd.com/projects/radeon/en/latest/docs/install/native_linux/install-radeon.html`
- Create a venv for VQA `python3 -m venv .venv`
- Activate the venv `source .venv/bin/activate`
- Install dependencies `pip install -r requirements.txt`
- (AMD) Install pytorch - see `requirements.remote.txt` for versions. Currently we use builds direct from AMD (vs from Wheels).
  - https://rocm.docs.amd.com/projects/radeon/en/latest/docs/install/native_linux/install-pytorch.html
  - AMD publishes the Docker images, so it's better to sync to their release schedule than PyTorch's published wheels.

The model needs to be explicitly downloaded before running.  This can be done with the `update_model.py` script in the tools folder.
- Create a new access token from huggingface: https://huggingface.co/settings/tokens
  - Select "read" permissions only
  - Copy the token
- Login to huggingface: `huggingface-cli login`
  - Do not set token as Github token
- Run `python3 tools/update_model.py`

(NOTE: Maybe we should have a download-only script, vs a full update version)



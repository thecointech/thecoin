After Checkout:

On Blank Windows Machine:
 - Ensure that Visual Studio C++ Development option is installed
  - Select the (Optional) Windows 10 SDK.
  - Win11 is supported in node-gyp 9, but for some reason we use node-gyp 8 from within the repo
  - This will fail compiling "canvas", but this is an optional dependency and only used in `site-nft`
   - If you really want it, you can follow the instructions here:  https://github.com/benjamind/delarre.docpad/blob/master/src/documents/posts/installing-node-canvas-for-windows.html.md
  - Install Java - OpenJDK JRE 17 from Azul.  Version shouldn't matter, but at time of writing v17 had an installer and v21 did not (so that's what was used)

NOTE:

for node-gyp errors on windows, ensure that it's (node-gyp is) looking in the right path for msbuild

https://github.com/nodejs/node-gyp/issues/1753


========================================================================================
====================================== JEST ============================================
================================= 2nd march 2020 =======================================
========================================================================================
The config to run Jest is jest.config.js at the root of the project. It needs to be added to the configuration of the Visual Studio Code (or the tool you are using).
For Visual Studio Code:
Go to Preferences -> Extensions -> Extension settings of the "Jest running" tool used and add the paths to the config file (the field should look like "jest.config.js" depending on you project setup).

If you have an error with json file not being included (like Status.json): check in the jest.config.json that the part bellow is correct and goes to the right tsconfig file.
    ...
    globals: {
        'ts-jest': {
            tsConfig: "tsconfig.base.json"
        }
    },
    ...

 ======== Note ========
 "jest-environment-uint8array" is here to remove the "Error: FIRESTORE (7.9.2) INTERNAL ASSERTION FAILED: value must be undefined or Uint8Array". The issue should be fixed in a future version.

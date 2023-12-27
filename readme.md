After Checkout:

On Blank Windows Machine: 
 - Ensure that Visual Studio C++ Development option is installed
  - Select the (Optional) Windows 10 SDK.  
  - Win11 is supported in node-gyp 9, but for some reason we use node-gyp 8 from within the repo
  - This will fail compiling "canvas", but this is an optional dependency and only used in `site-nft`
   - If you really want it, you can follow the instructions here:  https://github.com/benjamind/delarre.docpad/blob/master/src/documents/posts/installing-node-canvas-for-windows.html.md


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

On 2nd march 2020: 11 errors are still not fixed:
 - apps/broker-service/src/Buy/eTransfert.test.ts =>
        Error: invalid password
 - apps/broker-service/src/exchange/VerifiedBillPayments.test.ts =>
        Error: invalid password
 - apps/broker-service/src/exchange/VerifiedSale.test.ts =>
        Error: invalid password
 - apps/broker-service/src/exchange/VerifiedTransfert.test.ts =>
        Error: expect(received).rejects.toThrow(expected)
        Expected substring: "Insufficient funds"
        Received message:   "invalid password"
    AND
        Error: invalid password
 - apps/rates-service/test/UpdateDb.test.ts =>
        : Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Error:
    AND
        Error: Failed: "Could not retrieve rates"
 - apps/site/app/containers/ReturnProfile/Graph/sp500graph.test.ts =>
        4 x Error: ENOENT: no such file or directory, open '.\app\sp500_monthly.csv'



========================================================================================
==================================== Firestore =========================================
================================= 2nd march 2020 =======================================
========================================================================================
Root of the project: firebase emulators:start --only firestore
Check https://firebase.google.com/docs/cli for more infos
For local tests the firestore.rules can be modified of not used at all. If no rules are defined they will be considered open (read and write).

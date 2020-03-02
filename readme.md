After Checkout:

NOTE: 

for node-gyp errors on windows, ensure that it's (node-gyp is) looking in the right path for msbuild

https://github.com/nodejs/node-gyp/issues/1753

1) Ensure submodules are pulled

2) Connect to our private NPM feed.  

Instructions for connecting are here - we recommend only creating a 90-day token:
https://docs.microsoft.com/en-us/azure/devops/artifacts/get-started-npm?view=azure-devops&tabs=windows#set-up-authentication-on-your-development-machine

NOTE: Each repo already has the approriate .npmrc to set the stream source.  All that is required is to generate a token and save it in $HOME/.npmrc.  

You can "Connect to Feed" here to get started

https://tnadevelopment.visualstudio.com/TheCoin/_packaging?_a=feed&feed=the-coin

3) Execute the following 4 commands from the root of the-umbrella repository
npm install
cd site
npm install
npm start dev

You should see the following lines:
Using typescript@<b>3.7.0-beta</b> from typescript
Using tsconfig.json from <root>/site/tsconfig.json

4) There will be 2 errors listed - this is a result of us using a beta version of hte typescript compiler.  TS3.7 catches issues that older compilers did not, but not all packages have updated to deal with this.  At time of writing, we require two manual fixes:

4.1) TS2440: Import declaration conflicts with local declaration of 'Arrayish'.

To fix this, open the indicated and file delete line 5:

import { Arrayish } from './bytes'; <-- delete this

4.2) TS2440: Import declaration conflicts with local declaration of 'END'. 

To fix this, open the indicated file and change the following lines from line 242:

export const CANCEL: string
export const END: END
export type END = END

to 

export const CANCEL: string
export {END} <-- NOTE: This is the correct way to re-export a varable

5) Restart the webserver to pick up the changes.

At this point, the website should start and be hosted at https://localhost:3000

6) Open the following workspace in VS Code
"<root>/the-website-ts.code-workspace"

7) Change the default Typescript version in VS Code to (at least) 3.7.

At the time of writing, default TS version is 3.6.3.  This version does not support 
some of the features we use for code splitting.  To use the latest TS version. install:

https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next

8) In the debugger menu, select "Launch Chrome" and Press F5 to start debugging

You should now see the website load and be able to interact with it.



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
For local tests the firestore.rules can be modified of not used at all. If no rules are defined they will be considered open (read and write).
import emaillist from './emails.list.json';
import emailget from './emails.get.json';
import { gmail_v1, drive_v3 } from "googleapis";

import wallet0 from './wallet0.json';
import wallet1 from './wallet1.json';
import wallet2 from './wallet2.json';


// file deepcode ignore no-namespace: <comment the reason here>
export namespace google {


  export namespace auth {
    export class OAuth2 {
      credentials: any;
      setCredentials = () => {
        // Ignore input, just set default
        this.credentials = {
          access_token: "TEST_TOKEN"
        }
      }
      getToken = () => ({tokens: []});
      // In dev-live, redirect straight to the reciever page.
      generateAuthUrl = () => "http://localhost:3001/gauth?code=MockedCode"
    }
  }

  export function gmail() {
    return new GmailMocked();
  }

  export function drive() {
    return new DriveMocked();
  }

  class GmailMocked {
    users = {
      labels: {
        async list() {
          return {
            data: {
              labels: [
                {
                  name: 'etransfer',
                  id: 'etransfer'
                },
                {
                  name: 'deposited',
                  id: 'deposited'
                },
                {
                  name: 'rejected',
                  id: 'rejected'
                }
              ]
            }
          }
        }
      },

      messages: {
        async list() {
          return emaillist;
        },

        async get(opts: { id: string }) {
          return emailget.find(e => e.data.id === opts.id)
        },

        async modify(opts: gmail_v1.Params$Resource$Users$Messages$Modify) {
          const labelIds = opts.requestBody?.addLabelIds as string[]
          emailget
            .find(e => e.data.id === opts.id)
            ?.data.labelIds.push(...labelIds)
        }
      }
    }
  }

  const mockedFiles = [0, 1, 2].map(f => ({
    id: f.toString(),
    originalFilename: `wallet${f}.wallet`,
    name: `wallet${f}`,
  }));
  const mockedWallets = [JSON.stringify(wallet0), JSON.stringify(wallet1), JSON.stringify(wallet2)];

  class DriveMocked {
    // Minimal implementation

    files = {
      list: () => ({ data: { files: mockedFiles }}),
      get: ({fileId}: drive_v3.Params$Resource$Files$Get) => {
        const src = mockedFiles.find(f => f.id === fileId);
        if (!src || mockedWallets[fileId] == null) {
          return { status: 400 };
        }
        return {
          status: 200,
          data: mockedWallets[fileId]
        }
      },
      create: (p: drive_v3.Params$Resource$Files$Create) => {
        mockedFiles.push({
          id: mockedFiles.length.toString(),
          originalFilename: p.requestBody?.originalFilename || "walletX.wallet",
          name: p.requestBody?.name || "walletX"
        })
        mockedWallets.push(p.media.body);
        return { status: 200, statusText: "ok" }
      }
    }
  }
}

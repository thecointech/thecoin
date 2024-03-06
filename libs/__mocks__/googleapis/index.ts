import emaillist from './emails.list.json' assert {type: "json"};
import emailget from './emails.get.json' assert {type: "json"};
import { gmail_v1, drive_v3 } from "googleapis";
import { wallets } from '../wallets';

// file deepcode ignore no-namespace: <comment the reason here>
export namespace google {


  export namespace auth {
    export class OAuth2 {
      credentials: any;
      setCredentials = () => {
        // Ignore input, just set default
        this.credentials = {
          //  deepcode ignore HardcodedNonCryptoSecret: Not A Secret
          access_token: "TEST_TOKEN"
        }
      }
      getToken = () => ({tokens: []});
      // In dev-live, redirect straight to the reciever page.
      generateAuthUrl = () => "http://localhost:3001/#/gauth?code=MockedCode"
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
      },

      getProfile: () => ({ data: {
        emailAddress: `autodeposit@${process.env.TX_GMAIL_DEPOSIT_DOMAIN}` }
      }),
    }
  }

  class DriveMocked {
    // Minimal implementation

    files = {
      list: () => ({ data: { files: wallets }}),
      get: ({fileId}: drive_v3.Params$Resource$Files$Get) => {
        const src = wallets.find(f => f.id === fileId);
        if (!src) {
          return { status: 400 };
        }
        return {
          status: 200,
          data: src.wallet
        }
      },
      create: (p: drive_v3.Params$Resource$Files$Create) => {
        wallets.push({
          id: wallets.length.toString(),
          originalFilename: p.requestBody?.originalFilename || "walletX.wallet",
          name: p.requestBody?.name || "walletX",
          type: "uploaded",
          wallet: p.media!.body!
        })
        return { status: 200, statusText: "ok" }
      }
    }
  }
}

import emaillist from './emails.list.json' with { type: "json" }
import emailget from './emails.get.json' with { type: "json" }
import type { gmail_v1, drive_v3 } from "googleapis";
import { wallets } from '../wallets';
import os from 'node:os';
import fs from 'node:fs';

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
      generateAuthUrl = () => "http://localhost:3001/#/gauth?code=MockedCode"
    }
  }

  export function gmail() {
    return new GmailMocked();
  }

  export function drive() {
    return new DriveMocked();
  }

  const emailCacheFile = os.tmpdir() + "/devlive-email.json";

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
          if (!fs.existsSync(emailCacheFile)) {
            return emaillist;
          }
          // read the file
          const raw = fs.readFileSync(emailCacheFile, "utf8");
          // as JSON
          const json = JSON.parse(raw);
          return {
            data: {
              messages: json
            }
          }
        },

        async get(opts: { id: string }) {
          if (!fs.existsSync(emailCacheFile)) {
            return emailget.find(e => e.data.id === opts.id);
          }
          // read the file
          const raw = fs.readFileSync(emailCacheFile, "utf8");
          // as JSON
          const json = JSON.parse(raw);
          return {
            data: json.find((e: any) => e.id === opts.id)
          }
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

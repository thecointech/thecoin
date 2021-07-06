import emaillist from './emails.list.json';
import emailget from './emails.get.json';
import { gmail_v1, drive_v3 } from "googleapis";
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

  const mockedFiles = [1, 2, 3].map(f => ({
    id: f.toString(),
    originalFilename: `wallet${f}.wallet`,
    name: `wallet${f}`,
  }));

  class DriveMocked {
    // Minimal implementation

    files = {
      list: () => ({ data: { files: mockedFiles }}),
      get: ({fileId}: drive_v3.Params$Resource$Files$Get) => ({ status: 200, data: mockedFiles.find(f => f.id === fileId)}),
      create: (p: drive_v3.Params$Resource$Files$Create) => {
        mockedFiles.push({
          id: mockedFiles.length.toString(),
          originalFilename: p.requestBody?.originalFilename || "walletX.wallet",
          name: p.requestBody?.name || "walletX"
        })
        return { status: 200, statusText: "ok" }
      }
    }
  }
}

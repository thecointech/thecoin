import emaillist from './emails.list.json';
import emailget from './emails.get.json';

import { gmail_v1 } from "googleapis";
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
    console.log("Createing mocked gmail");
    return new GmailMocked();
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
                  id: '123'
                },
                {
                  name: 'deposited',
                  id: '234'
                },
                {
                  name: 'rejected',
                  id: '456'
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
}

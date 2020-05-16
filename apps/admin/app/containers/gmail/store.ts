import PouchDB from 'pouchdb';
import upsert from 'pouchdb-upsert';

PouchDB.plugin(upsert);

const dbName = "gmail_data";
const TOKEN_KEY = 'token.json';

type AuthRow = {
  token: string
}

export class DepositStore {
  private static db: PouchDB.Database<AuthRow>;
  private static counter: number = 0;

  static initialize(options?: PouchDB.Configuration.DatabaseConfiguration) {
    if (DepositStore.db == null) {
      console.log("Initializing DB");
      DepositStore.db = new PouchDB(dbName, options);
    }
    DepositStore.counter++;
  }

  static release() {
    DepositStore.counter = Math.max(0, DepositStore.counter - 1);
    if (0 == DepositStore.counter) {
      DepositStore.db?.close();
    }
  }

  static async setAuthToken(token: string) {
    DepositStore.db.upsert(TOKEN_KEY, () => ({ token }));
  }

  static async getAuthToken() : Promise<string|null> {
    const authRow = await DepositStore.db.find({
      selector: {
        _id: { $eq: TOKEN_KEY }
      }
    })
    if (authRow.docs?.length > 0)
      return authRow.docs[0].token;

    return null;
  }
}

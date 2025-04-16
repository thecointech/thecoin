import { Firestore } from '@google-cloud/firestore';
import { setFirestore } from './store';
import { log } from '@thecointech/logging';
import { GoogleAuth } from 'google-auth-library';
import { getSecret } from '@thecointech/secrets';

export * from './store';
export { FieldValue, Timestamp } from '@google-cloud/firestore';

type ServiceTypes = "RatesServiceAccount" | "BrokerServiceAccount";
export type NodeInit = {
  projectId?: string,
  service?: ServiceTypes,
}

export async function init(init?: NodeInit) {
  let db: Firestore;
  if (process.env.GAE_ENV) {
    log.debug('Connecting server-side db on GAE');
    // On Google App Engine, default credentials are used
    db = new Firestore();
  }
  else if (init?.service) {
    log.debug('Connecting server-side db running locally');
    // Create auth client first
    const credentials = await getFirestoreCredentials(init.service);
    const auth = new GoogleAuth({
      credentials
    });
    // Obtain the authenticated client
    const authenticatedClient = await auth.getClient();
    db = new Firestore({
      projectId: init?.projectId,
      authClient: authenticatedClient,
    });

  }
  else {
    throw new Error('Cannot connect to Firestore: no service account found');
  }
  setFirestore(db);
  return true;
}

async function getFirestoreCredentials(service: ServiceTypes) {
  const credentials = await getSecret(service);
  return JSON.parse(credentials);
}
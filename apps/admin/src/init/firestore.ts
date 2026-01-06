import { init, type BrowserInit } from '@thecointech/firestore';
import sampledb from './sampledb.dev.json';


declare global {
  interface Window {
    secrets: {
      getFirebaseConfig: () => Promise<BrowserInit>;
    };
  }
}
export async function initFirestore() {
  const config = await window.secrets.getFirebaseConfig();
  // Initialize with sample tx's in development mode
  return (process.env.CONFIG_NAME === 'development')
    ? init(sampledb)
    : init(config);
}

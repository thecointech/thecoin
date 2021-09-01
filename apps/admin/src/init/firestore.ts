import { init } from '@thecointech/firestore';
import sampledb from './sampledb.dev.json';

export function initFirestore() {
  // Initialize with sample tx's in development mode
  return (process.env.CONFIG_NAME === 'development')
    ? init(sampledb)
    : init();
}

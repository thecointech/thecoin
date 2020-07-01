import { initializeFirestore } from '@the-coin/utilities/Firestore.jestutils';
export { describe } from '@the-coin/utilities/Firestore.jestutils';

export const init = async () => initializeFirestore('broker-cad');

declare namespace NodeJS {
  interface Global {
    __thecoin: {
      firestore: any;
    }
  }
}

declare module 'firestore-jest-mock';

declare namespace NodeJS {
  interface Global {
    __thecoin: {
      firestore: any;
    }
  }
}

declare module 'base32' {
  function encode(buffer: Buffer) : string;
}

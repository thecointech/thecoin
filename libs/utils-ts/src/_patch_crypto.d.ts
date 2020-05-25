
  // Note: privateDecrypt was accidentially removed in one version of node typings
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/39180
  // I've fixed this issue before already by specifying explicit node version,
  // but somehow it's back and this seems to be safe enough until we upgrade our node version
// declare module 'crypto' {
//   //type KeyLike = string;
//   function privateDecrypt(private_key: RsaPublicKey | RsaPrivateKey | KeyLike, buffer: Buffer): Buffer;
//   function privateEncrypt(private_key: RsaPublicKey | RsaPrivateKey | KeyLike, buffer: Buffer): Buffer;
// }

declare module 'base32';

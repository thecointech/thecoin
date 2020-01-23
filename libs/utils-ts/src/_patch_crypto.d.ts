
  // Note: privateDecrypt was accidentially removed in one version of node typings
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/39180
  // I've fixed this issue before already by specifying explicit node version,
  // but somehow it's back and this seems to be safe enough until we upgrade our node version
declare module 'crypto' {
  function privateDecrypt(private_key: RsaPrivateKey, buffer: Buffer): Buffer;
  function privateEncrypt(private_key: RsaPrivateKey, buffer: Buffer): Buffer;
}
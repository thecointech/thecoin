import bs58 from 'bs58';

//
// Split the input URI into Gateway/Prefix/Hash in hex format, ready
// for submission to updateMetaSha256 contract fn
export function splitIpfsUri(uri: string) {
  // split into gateway/hash
  const separator = (uri.lastIndexOf('/') ?? -1) + 1;
  const gateway = separator ? uri.slice(0, separator) : undefined;
  const hash = uri.slice(separator);

  const decoded = bs58.decode(hash);
  const prefix = decoded.slice(0, 2);
  const digest = decoded.slice(2);

  return {
    gateway,
    prefix: `0x${prefix.toString("hex")}`,
    digest: `0x${digest.toString("hex")}`,
  }
}

import { existsSync } from "fs";

function getIsMockedFn() {
  switch (process.env.CONFIG_NAME) {
    case 'development':
      //
      // If running in dev mode, use all available mocks
      //
      return () => true;
    case 'devlive':
      //
      // Dev live is internally connected, but all external connections are mocked
      //
      return spec => ["googleapis", "google-auth-library", "axios"].includes(spec);
    default:
      //
      // Production environments only use config-specific mocks
      // (namely, signers/rbcapi in prodtest)
      //
      return () => false;
  }
}


const isMocked = getIsMockedFn();

export function getIfMocked(specifier, parentUrl) {
  // Do not re-direct explicit imports or relative ones
  if (specifier.startsWith("file://") || specifier.startsWith("."))
    return null;

  if (!isMocked(specifier))
    return null;

  // iterate over all the mocks in folder & create thingy for it.
  const mockRoot = new URL('../../__mocks__/', import.meta.url);
  const mockFolder = new URL(`./${specifier}/`, mockRoot);
  if (existsSync(mockFolder)) {
    // assume path
    return new URL('./index.ts', mockFolder);
  }
  const mockFile = new URL(`./${specifier}.ts`, mockRoot);
  if (existsSync(mockFile)) {
    // assume path
    return mockFile;
  }
  return null;
}


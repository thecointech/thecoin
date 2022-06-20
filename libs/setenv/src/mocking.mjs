import { existsSync } from "fs";

export function getIfMocked(specifier) {
  if (!specifier.startsWith("file://")) {
    // iterate over all the mocks in folder & create thingy for it.
    const mockRoot = new URL('./__mocks__/', import.meta.url);
    const mockFolder = new URL(`./${specifier}/`, mockRoot);
    if (existsSync(mockFolder)) {
      // assume path
      return new URL('./index.ts', mockFolder).toString();
    }
    const mockFile = new URL(`./${specifier}.ts`, mockRoot);
    if (existsSync(mockFile)) {
      // assume path
      return mockFile;
    }
  }
  return null;
}

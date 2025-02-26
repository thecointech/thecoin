

declare global {
  var __rootFolder: string;
}
export function setRootFolder(folder: string) {
  globalThis.__rootFolder = folder;
}
export function rootFolder(): string {
  return globalThis.__rootFolder ?? process.cwd();
}

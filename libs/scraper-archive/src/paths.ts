import path from "path";

export function tests(...args: string[]) {
  if (!process.env.PRIVATE_TESTING_PAGES) {
    throw new Error("PRIVATE_TESTING_PAGES is not set");
  }
  return path.join(process.env.PRIVATE_TESTING_PAGES, ...args);
}

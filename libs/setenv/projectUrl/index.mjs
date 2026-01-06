import { existsSync, readFileSync } from "fs";

export const projectUrl = () => {
  let baseUrl = new URL(`../../../`, new URL(import.meta.url));
  while (!isBase(baseUrl)) {
    const parentUrl = new URL(`..`, baseUrl);
    if (parentUrl.toString() == baseUrl.toString()) {
      throw new Error("Could not find project root");
    }
    baseUrl = parentUrl;
  }
  return baseUrl;
};

function isBase(url) {
  const packagePath = new URL("package.json", url);
  if (existsSync(packagePath)) {
    // Check that it's the right one
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    // If we are somehow in our own folder, it's not the root.
    return pkg.name !== "@thecointech/setenv";
  }
  return false;
}
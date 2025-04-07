import { existsSync } from "fs";
import { projectUrl } from "./index.mjs";

it ('Finds the root', () => {
  const root = projectUrl();
  expect(root).toBeDefined();
  expect(existsSync(new URL("environments", root))).toBe(true);
})
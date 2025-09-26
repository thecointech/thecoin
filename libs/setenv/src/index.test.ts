import { getEnvVars, loadEnvVars } from "./index.js"

const ORIGINAL_ENV = process.env;
beforeEach(() => {
  process.env = ORIGINAL_ENV;
});
afterAll(() => {
  process.env = ORIGINAL_ENV;
});

it("correctly expands variables when read", () => {
  const env = getEnvVars("development");
  expect(env.TEST_EXPAND).toEqual(env.CONFIG_NAME)
})

it("correctly expands variables when loaded", () => {
  loadEnvVars();
  expect(process.env.TEST_EXPAND).toBeDefined();
  expect(process.env.TEST_EXPAND).toEqual(process.env.CONFIG_NAME);
})

it("correctly sets default CONFIG_ENV", () => {
  loadEnvVars("prodtest");
  expect(process.env.CONFIG_ENV).toEqual("prodtest");
});

// Prod & ProdBeta share an CONFIG_ENV
it("Correctly reads prodbeta CONFIG_ENV", () => {
  loadEnvVars("prodbeta");
  expect(process.env.CONFIG_ENV).toEqual("prod");
})

it('Correctly gets CONFIG_ENV', () => {
  const env = getEnvVars("prodtest");
  expect(env.CONFIG_ENV).toEqual("prodtest");
})

it('Correctly gets prodbeta CONFIG_ENV', () => {
  const env = getEnvVars("prodbeta");
  expect(env.CONFIG_ENV).toEqual("prod");
})

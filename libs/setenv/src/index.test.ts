import { getEnvVars, loadEnvVars } from "./index"

it ("correctly expands variables when read", () => {
    const env = getEnvVars("development");
    expect(env.TEST_EXPAND).toEqual(env.CONFIG_NAME)
})

it ("correctly expands variables when loaded", () => {
    loadEnvVars();
    expect(process.env.TEST_EXPAND).toBeDefined();
    expect(process.env.TEST_EXPAND).toEqual(process.env.CONFIG_NAME);
})
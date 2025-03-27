import { jest } from '@jest/globals';

const mockAuth = {
  loginAccessToken: jest.fn<any>().mockResolvedValue(undefined)
};
const mockBitwardenClient = jest.fn().mockImplementation(() => ({
  auth: () => mockAuth,
  projects: () => ({
    list: jest.fn<any>().mockResolvedValue([])
  }),
  secrets: () => ({
    list: jest.fn<any>().mockResolvedValue({ data: [] })
  })
}));
const expectedOrgId = "test-org-id";
const expectedAccessToken = "test-token";
const expectedStateFile = "test-state";

jest.unstable_mockModule('@bitwarden/sdk-napi', () => ({
  BitwardenClient: mockBitwardenClient,
  DeviceType: { SDK: 1 }
}));
jest.unstable_mockModule('fs', () => ({
  existsSync: jest.fn<any>().mockReturnValue(true),
  readFileSync: jest.fn<any>().mockReturnValue(`ORGANIZATION_ID=${expectedOrgId}\nBWS_ACCESS_TOKEN=${expectedAccessToken}\nBWS_STATE_FILE=${expectedStateFile}`)
}));

const { getClient } = await import('./client');
describe("verify created client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      THECOIN_SECRETS: ".",
      CONFIG_NAME: "test"
    };
    global.__tc_secretClient = undefined;
    mockAuth.loginAccessToken.mockClear();
    mockBitwardenClient.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("handles race conditions by returning same client instance", async () => {
    // Setup a delayed mock implementation
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    mockAuth.loginAccessToken.mockImplementation(async () => {
      await delay(100); // Simulate network delay
      return undefined;
    });

    // Start multiple client requests simultaneously
    const clientPromise1 = getClient();
    const clientPromise2 = getClient();
    const clientPromise3 = getClient();

    const [Client1, Client2, client3] = await Promise.all([
      clientPromise1,
      clientPromise2,
      clientPromise3
    ]);

    // Verify we only created one client
    expect(mockBitwardenClient).toHaveBeenCalledTimes(1);
    expect(mockAuth.loginAccessToken).toHaveBeenCalledTimes(1);

    // Verify all promises resolved to the same instance
    expect(Client1).toBe(Client2);
    expect(Client2).toBe(client3);
  });

  it("sets organizationId correctly from env config", async () => {
    const client = await getClient();

    expect(client.organizationId).toBe(expectedOrgId);
    expect(mockBitwardenClient).toHaveBeenCalledTimes(1);
    expect(mockAuth.loginAccessToken).toHaveBeenCalledWith(expectedAccessToken, expectedStateFile);
  });

  it("propagates errors from createClient", async () => {
    process.env.THECOIN_SECRETS = undefined;

    await expect(getClient())
      .rejects
      .toThrow("Missing THECOIN_SECRETS environment variable");
  });
});

import { jest } from "@jest/globals";

const mockSecrets = {
  get: jest.fn<any>(),
  list: jest.fn<any>()
};
const mockClient = {
  secrets: () => mockSecrets,
  organizationId: "test-org"
};

// Mock the client module
jest.unstable_mockModule('./client', () => ({
  getClient: jest.fn<any>().mockResolvedValue(mockClient)
}));

// Import after mocking
const { getSecret, SecretKey, SecretNotFoundError } = await import('./getSecrets');

describe("verify secrets", () => {
  beforeEach(() => {
    // Reset all mocks and caches
    jest.clearAllMocks();
    global.__tc_nameToId = undefined;
    global.__tc_secretCache = new Map();

    // Setup default mock responses
    mockSecrets.list.mockResolvedValue({
      data: [
        { key: "VqaApiKey", id: "vqa-id-123" }
      ]
    });
    mockSecrets.get.mockResolvedValue({ value: "test-secret-value" });
  });

  it("caches secret values", async () => {
    // First call should hit the API
    const secret1 = await getSecret(SecretKey.VqaApiKey);
    expect(secret1).toBe("test-secret-value");
    expect(mockSecrets.get).toHaveBeenCalledTimes(1);
    expect(mockSecrets.list).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const secret2 = await getSecret(SecretKey.VqaApiKey);
    expect(secret2).toBe("test-secret-value");
    expect(mockSecrets.get).toHaveBeenCalledTimes(1); // No additional API calls
    expect(mockSecrets.list).toHaveBeenCalledTimes(1);

    // Verify cache contents
    expect(global.__tc_secretCache.get(SecretKey.VqaApiKey)).toBe("test-secret-value");
  });

  it("caches name to id mapping", async () => {
    // First call should fetch mapping
    await getSecret(SecretKey.VqaApiKey);
    expect(mockSecrets.list).toHaveBeenCalledTimes(1);

    // Second call should use cached mapping
    await getSecret(SecretKey.VqaApiKey);
    expect(mockSecrets.list).toHaveBeenCalledTimes(1); // No additional list calls

    // Verify mapping cache
    expect(global.__tc_nameToId).toEqual({
      VqaApiKey: "vqa-id-123"
    });
  });

  it("handles missing secrets", async () => {
    mockSecrets.list.mockResolvedValue({ data: [] });

    // Should throw when secret not found in mapping
    await expect(getSecret(SecretKey.VqaApiKey))
      .rejects
      .toThrow(SecretNotFoundError);
  });

  it("handles API errors", async () => {
    mockSecrets.get.mockRejectedValue(new Error("API Error"));

    // Should propagate API errors
    await expect(getSecret(SecretKey.VqaApiKey))
      .rejects
      .toThrow("API Error");
  });
});

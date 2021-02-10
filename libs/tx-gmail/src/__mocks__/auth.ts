

export const authorize = jest.fn().mockResolvedValue({
  credentials: {
    access_token: "MOCKED TOKEN"
  }
});

export const isValid = jest.fn().mockReturnValue(true);

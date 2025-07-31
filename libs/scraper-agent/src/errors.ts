import { ErrorResponse } from "@thecointech/vqa";

export class LoginFailedError extends Error {

  vqaResponse: ErrorResponse

  constructor(vqaResponse: ErrorResponse) {
    super("Login failed: " + vqaResponse.error_message);
    this.vqaResponse = vqaResponse;
  }
}

export class WrappedError extends Error {
  inner: unknown;
  section?: string;

  constructor(message: string, inner: unknown, section?: string) {
    super(message);
    this.name = "WrappedError";
    if (inner instanceof Error) {
      this.stack = inner.stack;
      this.message = `${section ?? 'Initial'}: ${message}: ${inner.message}`;
    }
    this.inner = inner;
    this.section = section;
  }
}

import { ErrorResponse } from "@thecointech/vqa";

export class LoginFailedError extends Error {

  vqaResponse: ErrorResponse

  constructor(vqaResponse: ErrorResponse) {
    super("Login failed: " + vqaResponse.error_message);
    this.vqaResponse = vqaResponse;
  }
}

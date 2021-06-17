export interface BoolResponse {
  success: boolean
}

export interface ValidateErrorJSON {
  message: string;
  details: { [name: string]: unknown };
}

export interface ServerError {
  message: string
}

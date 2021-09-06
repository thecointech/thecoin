import { DateTimeOptions } from "luxon";

export type Credentials = {
  password: string;
  cardNo: string;
  accountNo: string;

  pvq: Array<{question: string, answer: string}>,
  timezone: Pick<DateTimeOptions, "zone">;
}

export type AuthOptions = Credentials|{
  authFile: string // A JSON file where credentials are stored in the shape of Credentials
};

export const isCredentials = (options?: AuthOptions): options is Credentials =>
  !!(options as Credentials)?.password;



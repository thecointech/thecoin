import { GetUsername, GetPassword } from "@thecointech/store/firestore";
import { init } from "@thecointech/utilities/firestore";

export async function signIn() {
  const username = await GetUsername();
  const password = await GetPassword();

  if (!username || !password)
    throw new Error("Cannot init Firestore; bailing now");
  return await init({ username, password });
}

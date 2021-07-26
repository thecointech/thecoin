import { init } from '@thecointech/firestore';
import { ConfigStore } from '@thecointech/store';

//
// Username & password for firestore
const USER_KEY = "firestore-user";
const USER_PWD = "firestore-password";
export const GetUsername = () => ConfigStore.get(USER_KEY)
export const GetPassword = () => ConfigStore.get(USER_PWD)
export const SetUsername = (value: string) => ConfigStore.set(USER_KEY, value);
export const SetPassword = (value: string) => ConfigStore.set(USER_PWD, value);

export async function signIn() {
    const username = await GetUsername();
    const password = await GetPassword();
    if (!username || !password)
        return false;

    return await init({username, password});
}

export async function trySignIn(username: string, password: string) {

    const res = await init({username, password});
    if (res) {
        await SetUsername(username);
        await SetPassword(password);
    }
    return res;
}

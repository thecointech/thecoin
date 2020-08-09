import {init} from '@the-coin/utilities/firestore';
import { GetUsername, GetPassword, SetUsername, SetPassword } from './credentials';
// Needs Checking!m '../../utils/pathFix';
import {pathFix} from '../../utils/pathFix';
pathFix();

export async function signIn() {
    const user = await GetUsername();
    const password = await GetPassword();
    return await init("the-broker", user, password);
}

export async function TrySignIn(username: string, password: string) {

    const res = await init("the-broker", username, password); 

    if (res) {
        await SetUsername(username);
        await SetPassword(password);
    }
    return res;
}
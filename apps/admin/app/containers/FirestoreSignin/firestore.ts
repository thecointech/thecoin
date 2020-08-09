import {init} from '@the-coin/utilities/firestore';
import { GetUsername, GetPassword, SetUsername, SetPassword } from '@the-coin/store/firestore';

// Needs Checking!m '../../utils/pathFix';
import {pathFix} from '../../utils/pathFix';
pathFix();

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
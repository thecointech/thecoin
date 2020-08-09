import { ConfigStore } from './config';

//
// Username & password for firestore

const USER_KEY = "firestore-user";
const USER_PWD = "firestore-password";

export const GetUsername = () => ConfigStore.get(USER_KEY)
export const GetPassword = () => ConfigStore.get(USER_PWD)

export const SetUsername = (value: string) => ConfigStore.set(USER_KEY, value);
export const SetPassword = (value: string) => ConfigStore.set(USER_PWD, value);
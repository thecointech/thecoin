import { ConfigStore } from "../store";

const ACTION_KEY = "ActionPrivateKey";
export const setActionPrivateKey = (key: string) => ConfigStore.set(ACTION_KEY, key);
export const getActionPrivateKey = () => ConfigStore.get(ACTION_KEY);

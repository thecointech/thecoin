import React, { useState, useCallback } from "react";
import { GetUsername, SetUsername, SetPassword } from "./credentials";
import { Input, InputOnChangeData, Button } from "semantic-ui-react";
import { signIn } from "./firestore";

export const Firestore = async () => {

    const u = await GetUsername();
    return u == null
        ? <FirestoreSignIn />
        : undefined
}

export const FirestoreSignIn = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");



    const onSignIn = useCallback(() => {
        SetUsername(name);
        SetPassword(password);
        signIn();
    }, [name, password]);

    return (
        <>
            <Input onChange={OnChangeHook(setName)} value={name} />
            <Input onChange={OnChangeHook(setPassword)} value={password} />
            <Button onClick={onSignIn} />
        </>)
}

const OnChangeHook = (cb: (v: string) => void) =>
    useCallback((event: React.ChangeEvent<HTMLInputElement>, _data: InputOnChangeData) => {
        cb(event.currentTarget.value);
    },
        [cb]);
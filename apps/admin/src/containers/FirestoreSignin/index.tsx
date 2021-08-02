import React, { useState, useCallback, useEffect } from "react";
import { Input, InputOnChangeData, Button, Form, Segment, Header } from "semantic-ui-react";
import { signIn, trySignIn } from "./firestore";

export const FirestoreCheck = () => {
    const [hasSignIn, setHasSignIn] = useState(false);

    // Do we need to display?  If we have details, assume no
    useEffect(() => {
        signIn()
            .then(setHasSignIn)
            .catch(console.error);
    }, []);

    return hasSignIn
        ? null
        : <FirestoreSignIn onDone={setHasSignIn} />
}

type SetDone = (done: boolean) => void
export const FirestoreSignIn = (props: { onDone: SetDone }) => {

    const [signingIn, setIsSigningIn] = useState(false);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    // Try signing in
    const onSignIn = useCallback(() => {
        setIsSigningIn(true)
        trySignIn(name, password)
            .then(v => {
                props.onDone(v);
                setIsSigningIn(false);
            }).catch(err => {
                console.error(err);
                setIsSigningIn(false)
            });
    }, [name, password]);

    return (
        <Segment>
            <Header size="medium">FireStore not Connected!</Header>
            <Form>
                <Input disabled={signingIn} placeholder="username" onChange={OnChangeHook(setName)} value={name} /><br />
                <Input disabled={signingIn} placeholder="password" onChange={OnChangeHook(setPassword)} value={password} /><br />
                <Button onClick={onSignIn} loading={signingIn}>Sign-In</Button>
            </Form>
        </Segment>
    );
}


const OnChangeHook = (cb: (v: string) => void) =>
    useCallback((event: React.ChangeEvent<HTMLInputElement>, _data: InputOnChangeData) => {
        cb(event.currentTarget.value);
    }, [cb]);
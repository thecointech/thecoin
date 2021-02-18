import { useActiveAccount } from "../AccountMap";
import React, { useCallback, useEffect, useState } from "react"
import { Button, Input, InputOnChangeData } from "semantic-ui-react"
import { Wallet } from "ethers";
import { IDX } from "@ceramicstudio/idx";
import { BasicProfile } from "@ceramicstudio/idx-tools/dist/schemas";
import { getProvider } from "./connect";
import { createIDX } from "./idx";
import { createCeramic } from "./ceramic";

function useInputState(init: MaybeString) : [
  MaybeString,
  (v: MaybeString) => void,
  (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void
] {
  const [val, setValue] = useState(init);
  const cb = useCallback((_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) =>
    setValue(data.value)
  , [setValue]);

  return [val, setValue, cb];
}

export const IdxTester = () => {

  const account = useActiveAccount();
  const [idx, setIdx] = useState(undefined as IDX|undefined)
  const [name, setName, onNameChange] = useInputState(undefined as MaybeString);
  const [description, setDescription, onDescChange] = useInputState(undefined as MaybeString);
  const [doing, setDoing] = useInputState("...");

  useEffect(() => {
    setDoing('Loading');
    authenticate(account?.signer as Wallet)
      .then(async idx => {
        setIdx(idx);
        const profile = await getProfile(idx);
        setName(profile?.name);
        setDescription(profile?.description);
        setDoing('Loaded!');
      })
      .catch(setDoing);
  }, [account, setName, setDescription]);

  const updateValues = useCallback(async () => {
    setDoing('Saving');
    if (idx) {
      await updateProfile(idx, {
        name, description
      })
    }
    setDoing('Completed');
  }, [idx, name, description, setDoing])

  return (
    <>
      <div>{doing}</div>
      <Input name='name' value={name} onChange={onNameChange} />
      <Input name='description' value={description}  onChange={onDescChange} />
      <Button onClick={updateValues} />
    </>
  )
}

const ceramicPromise = createCeramic();

const authenticate = async (wallet: Wallet) => {
  const ceramic = await ceramicPromise;
  const provider = await getProvider(wallet);
  await ceramic.setDIDProvider(provider);
  const idx = createIDX(ceramic);
  return idx;
}

const updateProfile = (idx: IDX, profile: BasicProfile) =>
  idx?.set('basicProfile', profile);

const getProfile = (idx: IDX) =>
  idx?.get<BasicProfile>('basicProfile');

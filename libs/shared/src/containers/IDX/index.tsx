import { useActiveAccount } from "../AccountMap";
import React, { useCallback, useEffect, useState } from "react"
import { Button, Input, InputOnChangeData } from "semantic-ui-react"
import { Wallet } from "ethers";
import { IDX } from "@ceramicstudio/idx";
import { BasicProfile } from "@ceramicstudio/idx-tools/dist/schemas";
import { getProvider } from "./connect";
import { createIDX } from "./idx";
import { Ceramic } from "./ceramic";

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
  const [name, setName, onNameChange] = useInputState("");
  const [description, setDescription, onDescChange] = useInputState("");
  const [recipient, setRecipient, onRecipientChange] = useInputState("");
  const [doing, setDoing] = useInputState("...");

  const [savedNotes, setSavedNotes] = useState([] as string[]);
  const [note, setNote, onNoteChange] = useInputState("");

  useEffect(() => {
    setDoing('Loading');
    authenticate(account?.signer as Wallet)
      .then(async idx => {
        const profile = await getProfile(idx);
        setName(profile?.name ?? "");
        setDescription(profile?.description ?? "");

        const notes  = await loadNotes(idx);
        setSavedNotes(notes ?? []);
        setDoing('Loaded!');
      })
      .catch(err => {
        console.error(err);
        setDoing('loading error' + err.message);
      });
  }, [account, setName, setDescription, setSavedNotes]);

  const updateValues = useCallback(async () => {
    setDoing('Saving');
    if (idx) {
      await updateProfile(idx, {
        name, description
      })
    }
    setDoing('Completed');
  }, [idx, name, description, setDoing])

  const updateNotes = useCallback(async () => {
    setDoing('Saving');
    if (idx) {
      await createNote(idx, note!, recipient!)
      setRecipient("");
    }
    setDoing('Completed');
  }, [idx, note, setNote, recipient, setRecipient, setDoing])

  // const onNotesLengthChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
  //   const newLen = Number(data.value);
  //   if (newLen == notes.length)
  //     return;
  //   while (notes.length < newLen)
  //     notes.push('NewValue');
  //   // while (notes.length > newLen)
  //   //   notes.pop();
  //   console.log('Upd Notes length: ' + notes.length)
  //   setNotes(notes);
  // }, [notes, setNotes]);

  // const onNotesChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
  //   const {index, value} = data;
  //   notes[index] = value;
  //   console.log('Set Notes length: ' + notes.length)
  //   setNotes(notes);
  // }, [notes, setNotes]);

  // console.log('Notes: ' + JSON.stringify(notes))

  return (
    <>
      <div>{doing}</div>
      <Input name='name' value={name} onChange={onNameChange} placeholder="name" />
      <Input name='description' value={description}  onChange={onDescChange}  placeholder="description" />
      <br />
      <Button onClick={updateValues}>Save Profile</Button>
      <br />
      <Input value={recipient} onChange={onRecipientChange} placeholder="recipient"/>
      <Input value={note} onChange={onNoteChange} placeholder="note"/>
      <br />
      <Button onClick={updateNotes}>Save Note</Button>
      <br />
      {
        savedNotes.map((n, idx) => <div  dangerouslySetInnerHTML={{ __html: n }} key={idx}></div>)
      }
      <br />

    </>
  )
}

const authenticate = async (wallet: Wallet) => {
  const ceramic = Ceramic();
  const provider = await getProvider(wallet);
  await ceramic.setDIDProvider(provider);
  const idx = createIDX(ceramic);
  return idx;
}

const updateProfile = (idx: IDX, profile: BasicProfile) =>
  idx?.set('basicProfile', profile);

const getProfile = (idx: IDX) =>
  idx?.get<BasicProfile>('basicProfile');

interface SecretNotes {
  notes: any[]
}

const getDID = () => Ceramic().did!;

const createNote = async (idx: IDX, note: string, recipient: string) => {
  const record = await idx.get<SecretNotes>('secretNotes') || { notes: [] }
  const noteData = { recipient, note }
  const recipients = [idx.id] // always make ourselves a recipient
  if (recipient.length) recipients.push(recipient)

  const did = getDID();
  const encryptedNote = await did.createDagJWE(noteData, recipients)
  record.notes.push(encryptedNote)
  await idx.set('secretNotes', record)
}

const addNameToNote = async (idx: IDX, recipient: string) => {
  const { name } = await idx?.get<BasicProfile>('basicProfile', recipient);
  if (name) {
    return `<br /><b>Recipient name:</b> ${name}`
  }
  return `<br />couldn't find: ${recipient || '--'}`;
}

const loadNotes = async (idx: IDX) => {

  const did = getDID();
  // let user = did.id;
  const record = await idx.get<SecretNotes>('secretNotes');
  const asHtml = record?.notes?.map(async (encryptedNote) => {
    try {
      const decrypted = await did.decryptDagJWE(encryptedNote);
      const { recipient, note } = decrypted;
      let noteEntry = '<p>'
      if (recipient) {
        //noteEntry += '<b>Recipient:</b> ' + (recipient || '--') + `<span id="name${mapindex}"></span>`
        noteEntry += addNameToNote(idx, recipient)
      }
      noteEntry += '<br /><b>Note:</b> ' + note + '</p><hr />';
      return noteEntry;
    } catch (e) {
      return `<div>${e}</div>`;
    }
  });

  if (asHtml)
    return Promise.all(asHtml)
  return null;
}

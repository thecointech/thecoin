import { CeramicApi } from "@ceramicnetwork/common";
import { IDX } from "@ceramicstudio/idx";
import { Wallet } from "ethers/wallet"
import { createCeramic } from "./ceramic"
import { getProvider } from "./connect"
import { createIDX } from "./idx"
import { BasicProfile } from '@ceramicstudio/idx-constants';

let ceramic: CeramicApi;
const sampleProfile = {
  name: "Mr McGee",
  description: "A suave puppet of the night",
}
beforeAll(async () => {
  ceramic = await createCeramic()
})

const authenticate = async (wallet: Wallet) => {
  const provider = await getProvider(wallet);
  await ceramic.setDIDProvider(provider);
  const idx = createIDX(ceramic);
  return idx;
}

// const ethAddressToDID = async (address: string) => {
//   const caip10Doc = await window.ceramic?.createDocument('caip10-link', {
//     metadata: {
//       family: 'caip10-link',
//       controllers: [address.toLowerCase() + '@eip155:1']
//     }
//   })
//   return caip10Doc?.content
// }

const updateProfile = (idx: IDX, profile: BasicProfile) =>
  idx?.set('basicProfile', profile);

const getProfile = (idx: IDX) =>
  idx?.get<BasicProfile>('basicProfile');
// const createNote = async () => {
//   const record = (await window.idx?.get('secretNotes')) as SecretNotes || { notes: [] }
//   const recipient = (document.getElementById('recipient') as HTMLInputElement).value
//   const note = (document.getElementById('note') as HTMLInputElement).value
//   const noteData = { recipient, note }
//   const recipients = [window.did?.id as string] // always make ourselves a recipient
//   if (recipient) recipients.push(recipient)
//   const encryptedNote = await window.did?.createDagJWE(noteData, recipients)
//   record.notes.push(encryptedNote)
//   await window.idx?.set('secretNotes', record)
// }
it('can connect to idx', async () => {

  const wallet = Wallet.createRandom();
  const idx = await authenticate(wallet);

  // we do not yet have a profile
  const profile = await getProfile(idx);
  expect(profile).toBeNull();


  await updateProfile(idx, sampleProfile);

  const updatedProfile = await getProfile(idx);
  expect(updatedProfile).toBeTruthy();
  expect(updatedProfile?.name).toBe(sampleProfile.name)
})

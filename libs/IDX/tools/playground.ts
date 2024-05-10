import { DIDSession } from 'did-session'
import { EthereumNodeAuth, getAccountId } from '@didtools/pkh-ethereum'
import { ComposeClient }from '@composedb/client'
import { Wallet } from "ethers";
import { getDefintions } from '../src/definition';
import { JsonRpcProvider } from "ethers";
import { Ethers3Web3Converter } from '../src/ethers2web3';
import { setEncrypted, loadEncrypted } from '../src/encrypted';
import type { JWE } from 'did-jwt';
const provider = new JsonRpcProvider("http://127.0.0.1:9545");

import { DID } from 'dids'
import { getResolver } from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays/from-string'

// can it be read by another DID
const privateKeyHex = process.env.CERAMIC_SEED!;
const privateKey = fromString(privateKeyHex, 'base16')
const otherdid = new DID({
  resolver: getResolver(),
  provider: new Ed25519Provider(privateKey),
})
await otherdid.authenticate();

export async function auth() {
  const signer = provider.getSigner(0);

  const shim = new Ethers3Web3Converter(signer);
  const accountId = await getAccountId(shim, await signer.getAddress())
  const authMethod = await EthereumNodeAuth.getAuthMethod(shim, accountId, "https://app.thecoin.io");
  const definition = await getDefintions();
  const compose = new ComposeClient({
    ceramic: 'http://localhost:7007',
    definition,
  })

  const session = await DIDSession.authorize(authMethod, { resources: compose.resources })
  compose.setDID(session.did);
  return compose;
}


// async function writeProfile(compose: ComposeClient) {

//   const recipients = [otherdid.id];
//   const did = compose.did!
//   const owners = new Set([did.id, ...recipients])
//   // remove any undefined values from the data
//   const data = {
//     name: "I am a Pickle",
//     sin: "123-456-789",
//     address: "123 Main St",
//     more: {
//       anything: "can be put in here"
//     }
//   }

//   const encrypted = await did.createDagJWE(data, [...owners]);

//   const r = await compose.executeQuery(`
//   mutation CreateProfile($i: CreateProfileInput!) {
//     createProfile(input: $i) {
//       document {
//         id
//         iv
//         aad
//         tag
//         protected
//         ciphertext
//         recipients {
//           encrypted_key
//           header {
//             alg
//             iv
//             kid
//             tag
//             epk {
//               crv
//               kty
//               x
//             }
//           }
//         }
//       }
//     }
//   }`,
//   {
//     i: {
//       content: encrypted as any
//     }
//   });
//   console.log(r);

//   // Test decrypte
//   console.log((await did.decryptDagJWE(encrypted)));
//   console.log((await otherdid.decryptDagJWE(encrypted)));
// }

// async function readProfile(compose: ComposeClient) {
//   const r = await compose.executeQuery<{
//     viewer: {
//       profile: JWE
//     }
//   }>(`
//   query GetProfile {
//     viewer {
//       profile {
//         id
//         iv
//         aad
//         tag
//         protected
//         ciphertext
//         recipients {
//           encrypted_key
//           header {
//             alg
//             iv
//             kid
//             tag
//             epk {
//               crv
//               kty
//               x
//             }
//           }
//         }
//       }
//     }
//   }`)

//   if (r.data?.viewer.profile) {
//     const did = compose.did!
//     const decrypted = await did.decryptDagJWE(r.data.viewer.profile);
//     console.log(decrypted);

//     const decrypted2 = await otherdid.decryptDagJWE(r.data.viewer.profile);
//     console.log(decrypted2);
//     await did.authenticate()
//   }
// }

async function writeMessage(compose: ComposeClient) {
  compose.executeQuery(`
  mutation CreateMessage($i: CreateMessageInput!) {
    createMessage(input: $i) {
      document {
        id
        someText
      }
    }
  }`,
  {
    "i": {
      "content": {
        "someText": "Completely Different Text"
      }
    }
  })
}

// const signer = Wallet.createRandom().connect(provider)
const compose = await auth();

// await writeMessage(compose);
await setEncrypted(compose, {
  name: "I am a Pickle",
  sin: "123-456-789",
  address: "123 Main St",
  more: {
    anything: "can be put in here"
  }
}, [otherdid.id]);

const r1 = loadEncrypted(compose);

await readProfile(compose);

// const r = await compose.executeQuery(`
//   query {
//     viewer {
//       id
//     }
//   }
// `)
// console.log(r);

// const messages = await compose.executeQuery(`
// query GetMessages {
//   messageIndex(first: 10) {
//     edges {
//       node {
//         someText
//       }
//     }
//   }
// }`);
// console.log(messages);

// const msg = `this is mah message! ${new Date()}`;
// const m = await compose.executeQuery(`
// mutation {
//   createMessage(input: {
//     content: {
//       someText: "${msg}"
//     }
//   })
//   {
//     document {
//       someText
//     }
//   }
// }
// `)

// const profile = await compose.executeQuery(`
// query {
//   viewer {
//     profileSimple {
//       id
//       name
//       description
//       gender
//       emoji
//     }
//   }
// }`);
// console.log(profile);

// const sp = await compose.executeQuery(`
// mutation {
//   createProfileSimple(input: {
//     content: {
//       name: "Name - ${new Date()}"
//       description: "what do you see"
//       gender: "${undefined}"
//       emoji: "😀"
//     }
//   })
//   {
//     document {
//       name
//       description
//       gender
//       emoji
//     }
//   }
// }`)
// console.log(sp);

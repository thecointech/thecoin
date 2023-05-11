// This is an auto-generated file, do not edit manually
import type { RuntimeCompositeDefinition } from '@composedb/types'
export const definition: RuntimeCompositeDefinition = {"models":{"EncryptedProfile":{"id":"kjzl6hvfrbw6c6n29z7fi2kiq99t7ch3jppgt4zodugpskj57an17cb3nvt7upf","accountRelation":{"type":"single"}}},"objects":{"EncryptedProfileEphemeralPublicKey":{"e":{"type":"string","required":false},"n":{"type":"string","required":false},"x":{"type":"string","required":false},"y":{"type":"string","required":false},"crv":{"type":"string","required":false},"kty":{"type":"string","required":false}},"EncryptedProfileRecipientHeader":{"iv":{"type":"string","required":true},"alg":{"type":"string","required":true},"apu":{"type":"string","required":false},"apv":{"type":"string","required":false},"epk":{"type":"reference","refType":"object","refName":"EncryptedProfileEphemeralPublicKey","required":false},"kid":{"type":"string","required":false},"tag":{"type":"string","required":true}},"EncryptedProfileRecipient":{"header":{"type":"reference","refType":"object","refName":"EncryptedProfileRecipientHeader","required":true},"encrypted_key":{"type":"string","required":true}},"EncryptedProfile":{"iv":{"type":"string","required":true},"aad":{"type":"string","required":false},"tag":{"type":"string","required":true},"protected":{"type":"string","required":true},"ciphertext":{"type":"string","required":true},"recipients":{"type":"list","required":true,"item":{"type":"reference","refType":"object","refName":"EncryptedProfileRecipient","required":true}}}},"enums":{},"accountData":{"encryptedProfile":{"type":"node","name":"EncryptedProfile"}}}
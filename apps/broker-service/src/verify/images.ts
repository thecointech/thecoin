import { BlockpassData, TypedData } from '../controllers/types';
import { Storage } from '@google-cloud/storage';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { getSecret } from "@thecointech/secrets";

const storage = new Storage();

type IdentityKeys = keyof BlockpassData["identities"];
const imageKeys : IdentityKeys[] = [
  "proof_of_address", "selfie", "selfie_national_id", "driving_license"
];

export async function uploadAndStripImages({identities, refId}: BlockpassData) {

  log.debug({address: refId}, "Uploading KYC images for {address}")
  const now = DateTime.now();
  for (const key of imageKeys) {
    const imageData = identities[key];
    if (imageData) {
      log.debug({address: refId}, `Have KYC image: ${key} for {address}`)

      const upload = await uploadImage(key, refId, now, imageData);
      // If successful, strip the image from the DB data
      if (upload) {
        imageData.value = upload;
      }
      else {
        log.error({address: refId}, `Error uploading ${key}`);
      }
    }
  }
}


export async function uploadImage(name: string, address: string, now: DateTime, image: TypedData) {
  // assume valid encoding
  let encoding = image.type as BufferEncoding;
  // Just in case it's not
  if (!Buffer.isEncoding(encoding)) {
    log.warn({address}, `Warning: unknown image encoding of ${encoding} for {address} - ${name}`);
    // Just store raw string
    encoding = "utf8"
  }

  const bucketName = await getSecret("GCloudImageStorageBucket");
  if (bucketName) {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`${address}/${now.toString()}/${name}.png`);

    const buffer = Buffer.from(image.value, encoding);
    await file.save(buffer, {
      gzip: true,
      resumable: false,
      // contentType: ?"image/png" ??
    })
    return `Uploaded: ${now.toString()}`;
  }

  return `Dropped from ${process.env.CONFIG_NAME}`;
}

import React, { useState } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Button, Form } from 'semantic-ui-react';
import { AppContainer } from '../AppContainers';
import { PageHeader } from '../PageHeader';
import { log } from '@thecointech/logging';
import icon from './images/icon_topup_big.svg';
import { Upload } from '../Upload';
import { getHash, readExif } from '../ProfileBuilder/SignAndUpload/sign';
import { getContract } from '@thecointech/contract-nft';
import { verifyMessage } from 'ethers';

const title = defineMessage({ defaultMessage: "Validate Image", description: "page title" });
const description = defineMessage({ defaultMessage: "Validate the images cryptographic signature", description: "page instructions" });
//const imageUri = defineMessage({ defaultMessage: "URI of image to validate", description: "Optional uri" });
const validate = defineMessage({ defaultMessage: "Validate", description: "Page action Button" });

export const Validate = () => {
  //const intl = useIntl();
  const [file, setFile] = useState<File | undefined>();
  //const [uri, setUri] = useState('');
  const [results, setResults] = useState('');

  const doValidateImage = async () => {
    log.trace("Validating image");
    if (!file) return;

    const valid = await isValid(file);
    setResults(valid.toString());
  }
  return (
    <AppContainer shadow>
      <PageHeader illustration={icon} title={title} description={description} />
      {file
        ? <img src={URL.createObjectURL(file)} />
        : <Upload onFileAdded={setFile} disabled={false} />
      }
      <Form>
        {/* <Form.Input
          value={uri}
          placeholder={intl.formatMessage(imageUri)}
          onChange={(_, d) => setUri(d.value)}
        /> */}
        <Button onClick={doValidateImage} >
          <FormattedMessage {...validate} />
        </Button>
        <div>Image Valid: {results ?? ''}</div>
      </Form>
    </AppContainer>
  )
}

async function isValid(blob: Blob): Promise<boolean> {
  // Convert to canvas
  const canvas = await getCanvas(blob);
  // first read metadata. For now we simply fail if there
  // is no metadata available.  However, we could also
  // iterate all available token meta and see if we match
  // This would handle cases where the meta is stripped away
  const meta = await readMetadata(blob);
  if (!meta) return false;

  // Get hash of canvas
  const hash = await getHash(canvas);
  // Is this image the same as the one that was signed?
  if (hash != meta.hash)
    return false;

  // Does the signature owner own any tokens?
  const nft = await getContract();
  const owner = verifyMessage(hash, meta.signature);
  const balance = await nft.balanceOf(owner);
  if (balance == 0n)
    return false;

  return true;
}

const getCanvas = (blob: Blob) =>
  new Promise<HTMLCanvasElement>((resolve, reject) => {
    const img = new Image;
    img.onload = () => {
      const el = document.createElement('canvas');
      el.width = img.width;
      el.height = img.height;
      const ctx = el.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      if (ctx) resolve(el);
      else reject('Could not create context');
    }
    img.src = URL.createObjectURL(blob);
  })


const readMetadata = (blob: Blob) =>
  new Promise<ReturnType<typeof readExif>>((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const exif = readExif(event.target?.result as string);
      resolve(exif);
    }
    reader.readAsDataURL(blob)
  })

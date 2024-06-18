import * as React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { IsValidAddress } from '@thecointech/utilities';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';
import {useDropzone, FileRejection} from 'react-dropzone';
import { log } from '@thecointech/logging';
import { Wallet } from 'ethers';

const translate = defineMessages({
  aboveTheTitle: {
    defaultMessage: "Restore Account",
    description: "shared.account.uploadWallet.aboveTheTitle: The above the title title for the upload your account page"
  },
  title: {
    defaultMessage: "Load an Account",
    description: "shared.account.uploadWallet.title: Title for the upload your account page"
  },
  dropZone: {
    defaultMessage: "Drag 'n' drop a wallet file here, or click to browse",
    description: "shared.account.uploadWallet.dropZone: The title for the drop zone on the upload your account page"
  }
});

export type UploadData = {
  wallet: Wallet;
  name: string;
}
type UploadCallback = (data: UploadData) => void;
type ValidateCallback = (data: UploadData) => boolean;

type Props = {
  onUpload?: UploadCallback;
  onValidate?: ValidateCallback;
}

export const UploadWallet = (props: Props) => {

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({accept: '.json'});

  // Alert if drag 'n drop has new invalid file
  const [rejected, setRejected] = React.useState<FileRejection[]>([]);
  if (fileRejections.length && fileRejections != rejected) {
    alert(fileRejections[0].errors[0]?.message ?? "Invalid file");
    setRejected(fileRejections);
  }

  // On valid file, report to owner
  React.useEffect(() => {
    if (acceptedFiles.length == 0) return;
    (async () => {
      const data = await readFile(acceptedFiles[0]);
      const isValid =  props.onValidate?.(data) ?? IsValidAddress(data.wallet.address)
      if (isValid) {
        props.onUpload?.(data)
      } else {
        alert('File is not a valid wallet');
      }
    })();
  }, [acceptedFiles])

  const className = `font-label ${styles.dropzone} ${isDragActive ? styles.active : ''}`;

  return (
    <Container className={styles.content}>
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...translate.aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x12spaceAfter`}>
          <FormattedMessage {...translate.title} />
      </Header>
      <div {...getRootProps({className})}>
        <input {...getInputProps()} />
        <p>
          <FormattedMessage {...translate.dropZone} />
        </p>
      </div>
    </Container>
  );
}

function readFile(file: File): Promise<UploadData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ({target}) => {
      try {
        const raw = target?.result?.toString();
        if (raw) {
          const asJson = JSON.parse(raw.trim());
          const asName = file.name.split('.')[0];
          resolve({
            wallet: asJson,
            name: asName
          });
        }
      }
      catch(e: any) {
        log.error(e, "Cannot load file");
      }
      reject("Invalid file");
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

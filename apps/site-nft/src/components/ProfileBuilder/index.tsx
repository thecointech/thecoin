import React, { useEffect, useState } from 'react';
import { AppContainer } from '../AppContainers';
import { PageHeader } from '../PageHeader';
import icon from './images/icon_payment_big.svg';
import { defineMessage, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';
import { Editor } from './Editor';
import { TokenIdSelect } from './TokenIdSelect';
import { OptionToggles } from './OptionToggles';
import { getContract } from '@thecointech/nft-contract';
import { BigNumber } from 'ethers/utils';
import { Options } from './types';
import { log } from '@thecointech/logging';
import { ImageEditorComponent } from '@toast-ui/react-image-editor';
import { signAndUpload } from './SignAndUpload';
import { Button } from 'semantic-ui-react';

const title = defineMessage({ defaultMessage: "Create Profile Image", description: "Title message on profile page" });
const description = defineMessage({ defaultMessage: "Create and sign an image to show your carbon-neutral status", description: "Profile instructions" });
const upload = defineMessage({ defaultMessage: "Sign & Upload", description: "Profile upload button" });

export const ProfileBuilder = () => {
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [options, setOptions] = useState<Options>({})
  const [years, setYears] = useState<[number, number] | undefined>();

  const editorRef = React.createRef<ImageEditorComponent>();

  useEffect(
    () => {
      getYears(tokenIds)
        .then(setYears)
        .catch(log.error);
    },
    [tokenIds[0]]
  );

  return (
    <AppContainer shadow className={styles.page}>
      <PageHeader illustration={icon} title={title} description={description} />
      <Editor
        oref={editorRef}
        years={options.showYears ? years : undefined}
        tokenId={options.showTokenId ? Math.min(...tokenIds) : undefined}
        showFrame={options.showFrame}
      />

      <OptionToggles state={options} setState={setOptions} />
      <div className={styles.submitRow}>
        <TokenIdSelect tokenIds={tokenIds} setTokenIds={setTokenIds} />
        <Button onClick={() => signAndUpload(editorRef.current)}><FormattedMessage {...upload} /></Button>
      </div>
    </AppContainer>
  )
}

async function getYears(tokenIds: number[]): Promise<[number, number] | undefined> {
  if (tokenIds.length == 0) return undefined;
  const nft = getContract();
  const validBN = await Promise.all(
    tokenIds.map(id => nft.validity(id))
  );
  const valids = validBN.map(([start, end]: [BigNumber, BigNumber]) => [start.toNumber(), end.gt(9999) ? 9999 : end.toNumber()]);

  // get current year, walk backwards
  // TODO: This code must be revised prior to 2024
  const start = Math.min(...valids.map(([start,]) => start));
  const end = Math.max(...valids.map(([,end]) => end));
  return [start, end];
}

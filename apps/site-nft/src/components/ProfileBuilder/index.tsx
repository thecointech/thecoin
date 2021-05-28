import React, { useEffect, useState } from 'react';
import { AppContainer } from '../AppContainers';
import { PageHeader } from '../PageHeader';
import icon from './images/icon_payment_big.svg';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Button } from 'semantic-ui-react';
import styles from './styles.module.less';
import { Editor } from './Editor';
import { ImageEditorComponent } from '@toast-ui/react-image-editor';
import { TokenIdSelect } from './TokenIdSelect';
import { OptionToggles } from './OptionToggles';
import { getContract } from '@thecointech/nft-contract';
import { BigNumber } from 'ethers/utils';
import { Options } from './types';

const title = defineMessage({ defaultMessage: "Create Profile Image", description: "Title message on profile page" });
const description = defineMessage({ defaultMessage: "Create and sign an image to show your carbon-neutral status", description: "Profile instructions" });
const upload = defineMessage({ defaultMessage: "Sign & Upload", description: "Profile upload button" });

export const ProfileBuilder = () => {
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [options, setOptions] = useState<Options>({})
  const [years, setYears] = useState<[number, number] | undefined>();

  const ref = React.createRef<ImageEditorComponent>();

  useEffect(
    () => { getYears(tokenIds, options.showYears).then(setYears) },
    [tokenIds]
  );

  return (
    <AppContainer shadow className={styles.page}>
      <PageHeader illustration={icon} title={title} description={description} />
      <Editor ref={ref}
        years={options.showYears ? years : undefined}
        tokenId={options.showTokenId ? Math.min(...tokenIds) : undefined}
        showFrame={options.showFrame}
      />

      <OptionToggles state={options} setState={setOptions} />

      <div className={styles.submitRow}>
        <TokenIdSelect tokenIds={tokenIds} setTokenIds={setTokenIds} />
        <Button><FormattedMessage {...upload} /></Button>
      </div>
    </AppContainer>
  )
}

async function getYears(tokenIds: number[], showYears?: boolean): Promise<[number, number] | undefined> {
  if (!showYears || tokenIds.length == 0) return undefined;
  const nft = getContract();
  const years = await Promise.all(
    tokenIds.map(id => nft.validity(id))
  );
  const validities = years.map(([start, end]: [BigNumber, BigNumber]) => [start.toNumber(), end.gt(9999) ? 9999 : end.toNumber()]);

  console.log(validities);
  return [1234, 1234];
}

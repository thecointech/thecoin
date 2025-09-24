import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { UploadData } from '@thecointech/shared/containers/UploadWallet';
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { getData, Key } from '../Training/data';
import { path } from './routes'
import { PathNextButton, PathRouter, PathSteps } from '@/SimplePath';
import { ContentSection } from '@/ContentSection';


export const Account = () => {

  const navigation = useHistory();
  const active = AccountMap.useActive();
  const api = AccountMap.useApi();
  const stored = getData(Key.wallet);

  useEffect(() => {
    if (!active && stored) {
      const storedWallet = JSON.parse(stored) as UploadData;
      api.addAccount(storedWallet.name, storedWallet.wallet.address, storedWallet.wallet);
      api.setActiveAccount(storedWallet.wallet.address);
      navigation.push('/account/1');
    }
  }, []);

  return (
    <div>
      <PathSteps path={path} data={active}/>
      <div>
        <ContentSection>
          <PathRouter path={path} />
          <PathNextButton path={path} />
        </ContentSection>
      </div>
    </div>
  )
}

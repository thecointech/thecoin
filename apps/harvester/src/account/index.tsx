import { AccountMap } from '@thecointech/shared/containers/AccountMap';
// import { UploadData } from '@thecointech/shared/containers/UploadWallet';
import { useEffect } from 'react'
// import { useHistory } from 'react-router-dom'
// import { getData, Key } from '../Training/data';
import { useAccountPath } from './routes'
import { PathNextButton, PathRouter, PathSteps } from '@/SimplePath';
import { ContentSection } from '@/ContentSection';


export const Account = () => {

  const active = AccountMap.useActive();
  const api = AccountMap.useApi();

  const path = useAccountPath();


  useEffect(() => {
    window.scraper.getCoinAccountDetails().then(res => {
      if (res.error) {
        alert(res.error);
      } else {
        if (res.value) {
          api.addAccount(res.value.name, res.value.address, {} as any);
          api.setActiveAccount(res.value.address);
        }
      }
    });
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

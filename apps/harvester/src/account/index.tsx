import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useAccountPath } from './routes'
import { PathRouter, PathSteps } from '@/SimplePath';
import { ContentSection } from '@/ContentSection';


export const Account = () => {

  const path = useAccountPath();
  const accounts = AccountMap.useData();
  // Don't call useActive directly, as it will always
  // return an account if it can (even if active is set to null)
  const active = accounts.map[accounts.active ?? ""];

  return (
    <div>
      <PathSteps path={path} data={active}/>
      <div>
        <ContentSection>
          <PathRouter path={path} data={active} />
          {/* <ContentSection.Next to="" content="Next" /> */}
        </ContentSection>
      </div>
    </div>
  )
}

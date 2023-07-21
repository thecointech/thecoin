
import { Button, Message, Step } from 'semantic-ui-react'
import { useEffect, useState } from 'react';
import { TrainingRouter } from './routes';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { getData, Key } from './data';
import { NormalizeAddress } from '@thecointech/utilities';
import { TrainingReducer } from './state/reducer';
import styles from './index.module.less';

export const Training = () => {
  const [address, setAddress] = useState<string|null|undefined>(undefined);
  const stored = getData(Key.wallet);
  const navigate = useHistory();
  const location = useLocation();

  TrainingReducer.useStore();
  const data = TrainingReducer.useData();

  // Ensure we have a valid account in the scraper
  useEffect(() => {
    window.scraper.getWalletAddress().then(result => {
      // main-world has an address
      if (result.value) {
        // Check that it matches our render-world wallet
        if (stored) {
          const uploaded = JSON.parse(stored);
          const renderAddress = NormalizeAddress(uploaded.wallet.address)
          const mainAddress = NormalizeAddress(result.value);
          if (mainAddress != renderAddress) {
            alert("WARNING: Scraper wallet does not match loaded wallet, login to update scraper");
            navigate.push("/account/login");
          }
        }
      }
      setAddress(result.value);
    })
  }, [])

  const page0Complete = isUrl(data.chequing.url) && isUrl(data.visa.url);
  const cdComplete = data.hasCreditDetails;
  const page1Complete = !!(data.chequing.warm && data.visa.warm);
  const page2Complete = data.chequing.testPassed;
  const page3Complete = data.visa.testPassed;
  const page4Complete = data.chequing.eTransferPassed;

  const nextPage = () => {
    const curr = location.pathname;
    // Page is last number
    const m = curr.match(/\/step([0-9])$/)
    if (m) {
      if (m[1] == "6") {
        navigate.push("/config/step0");
      }
      else {
        navigate.push("/train/step" + (parseInt(m[1]) + 1));
      }
    } else {
      navigate.push("/train/step0");
    }
  }

  return (
    <div>
      <Step.Group ordered>
        <TrainingStep
          title="Intro"
          description="Why we train"
          page={0}
          completed={page0Complete}
          disabled={false}
          pathname={location.pathname} />
        <TrainingStep
          title="Details"
          description="Credit details"
          page={1}
          completed={cdComplete}
          disabled={!page0Complete}
          pathname={location.pathname} />
        <TrainingStep
          title="Warmup"
          description="Prep the AI"
          page={2}
          completed={page1Complete}
          disabled={!cdComplete}
          // completed={isLoggedIn}
          pathname={location.pathname} />
        <TrainingStep
          title="Chequing"
          description="Learn to earn"
          page={3}
          completed={page2Complete}
          disabled={!page1Complete}
          pathname={location.pathname} />
        <TrainingStep
          title="Visa"
          description="Learn to earn"
          page={4}
          completed={page3Complete}
          disabled={!page2Complete}
          pathname={location.pathname} />
        <TrainingStep
          title="Send e-transfer"
          description="Learn to pay"
          page={5}
          completed={page4Complete}
          disabled={!page3Complete}
          pathname={location.pathname} />
        <TrainingStep
          title="Complete"
          description="Start Earning"
          page={6}
          completed={page4Complete}
          disabled={!page4Complete}
          pathname={location.pathname} />
      </Step.Group>
      <Message warning hidden={address !== null}>
        There is no account loaded yet.  It is highly recommended to setup
        your account before training your scraper.<br />
        <Link to="/account/upload">Upload an Account</Link>
      </Message>
      <div className={styles.container}>
        <TrainingRouter />

        <Button onClick={nextPage}>Next</Button>
      </div>
    </div>
  )
}


type TrainingStepProps = {
  title: string
  description: string,
  page: number,
  // validPage: number
  completed?: boolean
  // to: string
  pathname: string
  disabled?: boolean
}
const TrainingStep = (p: TrainingStepProps) => (
  <Step as={Link} completed={p.completed} disabled={p.disabled} to={`/train/step${p.page}`} active={p.pathname.endsWith(`${p.page}`)}>
    <Step.Content>
      <Step.Title>{p.title}</Step.Title>
      <Step.Description>{p.description}</Step.Description>
    </Step.Content>
  </Step>
)

const isUrl = (url?: string) => {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

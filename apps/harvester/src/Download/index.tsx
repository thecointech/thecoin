import styles from './browser.module.less'
import { Button, Message } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getErrors, useBackgroundTask } from '@/BackgroundTask';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';
import { QuestionResponse } from '@/Agent/QuestionResponse';
import { isRunning } from '@/BackgroundTask';

export const Browser = () => {

  const [hasInstalled, setHasInstalled] = useState(false);
  const initializeTask = useBackgroundTask('initialize');
  const installing = isRunning(initializeTask);

  useEffect(() => {
    window.scraper.hasInstalledBrowser().then(r => setHasInstalled(r.value ?? false))
  }, []);

  // Update on complete
  useEffect(() => {
    if (initializeTask) {
      if (!isRunning(initializeTask) && getErrors(initializeTask).length === 0) {
        setHasInstalled(true);
      }
    }
  }, [initializeTask])

  // const browserApi = BrowserReducer.useApi();
  const startDownload = () => {
    window.scraper.downloadLibraries();
  }

  return (
    <div className={styles.container} >
      <h2>
        Download necessary libraries
      </h2>
      <h4>
        Your harvester requires several libraries to function.  These can be downloaded below.
      </h4>
      <OnCompleteMessage complete={hasInstalled} />
      {/* Allow user to confirm closing any running chrome instances */}
      <QuestionResponse enabled={installing} />
      <BackgroundTaskProgressBar type="initialize" />
      <BackgroundTaskErrors type="initialize" />
      <div>
        <Button onClick={startDownload} disabled={installing} loading={installing}>Download</Button>
      </div>
      <div>
        <Link to="/account/login">Setup your Account</Link>
      </div>
    </div>
  )
}

const OnCompleteMessage = ({ complete }: { complete: boolean }) => {
  return complete ? (
    <Message positive>
      Initialization complete
    </Message>
  ) : null;
}

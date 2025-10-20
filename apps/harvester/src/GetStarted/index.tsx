import { Button, Message } from 'semantic-ui-react'
import { useEffect, useState } from 'react';
import { getErrors, useBackgroundTask } from '@/BackgroundTask';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';
import { QuestionResponse } from '@/Agent/QuestionResponse';
import { isRunning } from '@/BackgroundTask';
import { ContentSection } from '@/ContentSection';
import { NextButton } from '@/NextButton';

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

  const startDownload = () => {
    window.scraper.downloadLibraries();
  }

  return (
    <>
    <ContentSection>
      <h2>
        Download necessary libraries
      </h2>
      <h4>
        Your harvester requires several libraries to function.  These can be downloaded below.
      </h4>
      <OnCompleteMessage complete={hasInstalled} />
      {/* Allow user to confirm closing any running chrome instances */}
      <QuestionResponse backgroundTaskId="initialize" />
      <BackgroundTaskProgressBar type="initialize" />
      <BackgroundTaskErrors type="initialize" />
      <div>
        <Button onClick={startDownload} disabled={installing} loading={installing}>Download</Button>
      </div>
    </ContentSection>
    <NextButton to="/account" content="Connect your Coin Account" />
    </>
  )
}

const OnCompleteMessage = ({ complete }: { complete: boolean }) => {
  return complete ? (
    <Message positive>
      Initialization complete
    </Message>
  ) : null;
}
